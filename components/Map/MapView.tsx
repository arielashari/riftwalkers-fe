'use client'

import 'mapbox-gl/dist/mapbox-gl.css';
import {useRef, useEffect, useState} from 'react'
import mapboxgl from 'mapbox-gl'
import {riftsRepository} from "@/repository/rifts";
import {Rift, RiftDifficulty} from "@/types/rift";
import {RiftModal} from "@/components/Rift/RiftModal";
import {playersRepository} from "@/repository/players";
import {usePlayerStore} from "@/store";
import {observer} from "mobx-react-lite";

const MapView = observer(() => {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const riftMarkersRef = useRef<mapboxgl.Marker[]>([]);

    const playerStore = usePlayerStore();
    const { data, isLoading } = riftsRepository.hooks.useRift();

    const [mapLoaded, setMapLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRift, setSelectedRift] = useState<Rift | null>(null);

    // Fetch player info
    useEffect(() => {
        playersRepository.api.getPlayers()
            .then(resp => {
                playerStore.setPlayer(resp.data);
            })
            .catch(e => {
                console.log(e);
            });
    }, [playerStore]);

    // Initialize Mapbox map
    useEffect(() => {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token || !mapContainerRef.current) {
            console.error("Mapbox token is not defined or container is missing");
            return;
        }

        mapboxgl.accessToken = token;

        const initializeMap = (lng: number, lat: number) => {
            const map = new mapboxgl.Map({
                container: mapContainerRef.current!,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [lng, lat],
                zoom: 15,
            });

            mapRef.current = map;

            // Set user marker
            new mapboxgl.Marker()
                .setLngLat([lng, lat])
                .addTo(map);

            map.on('load', () => {
                setMapLoaded(true);
            });
        };

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => initializeMap(pos.coords.longitude, pos.coords.latitude),
                (err) => {
                    console.error('Error getting location:', err);
                    initializeMap(-74.0242, 40.6941); // fallback location
                }
            );
        } else {
            initializeMap(-74.0242, 40.6941); // fallback location
        }

        return () => {
            mapRef.current?.remove();
        };
    }, []);

    // Add rift markers when map is loaded and data is available
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || !data || !Array.isArray(data)) return;

        // Remove old markers
        riftMarkersRef.current.forEach(marker => marker.remove());
        riftMarkersRef.current = [];

        // Add new markers
        data.forEach(rift => {
            const colorMap: Record<RiftDifficulty, string> = {
                EASY: '#4CAF50',       // Green
                MEDIUM: '#2196F3',     // Blue
                HARD: '#FF9800',       // Orange
                VERY_HARD: '#F44336',  // Red
                EXTREME: '#9C27B0',    // Purple
            };

            // @ts-ignore
            const markerColor = colorMap[rift.difficulty] || '#607D8B'; // Fallback: blue-gray

            const marker = new mapboxgl.Marker({ color: markerColor })
                .setLngLat([rift.longitude, rift.latitude])
                .addTo(mapRef.current!);

            marker.getElement().addEventListener('click', () => {
                setSelectedRift(rift);
                setIsModalOpen(true);
            });

            riftMarkersRef.current.push(marker);
        });
    }, [mapLoaded, data]);

    return (
        <>
            <RiftModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedRift}
            />
            <div
                id="map-container"
                className="h-screen w-full bg-gray-400"
                ref={mapContainerRef}
            />
        </>
    );
});


export default MapView;
