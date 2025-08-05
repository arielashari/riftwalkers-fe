'use client'

import 'mapbox-gl/dist/mapbox-gl.css';
import {useRef, useEffect, useState} from 'react'
import mapboxgl from 'mapbox-gl'
import {riftsRepository} from "@/repository/rifts";
import {Rift} from "@/types/rift";
import {RiftModal} from "@/components/Rift/RiftModal";
import {playersRepository} from "@/repository/players";
import {usePlayerStore} from "@/store";
import {observer} from "mobx-react-lite";

const MapView = observer(() => {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const playerStore = usePlayerStore();
    const { data, isLoading } = riftsRepository.hooks.useRift();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRift, setSelectedRift] = useState<Rift | null>(null);

    // Track rift markers so we can remove/re-add if needed
    const riftMarkersRef = useRef<mapboxgl.Marker[]>([]);

    // Fetch player data on mount
    useEffect(() => {
        playersRepository.api.getPlayers()
            .then(resp => {
                playerStore.setPlayer(resp.data);
            })
            .catch(e => {
                console.log(e);
            });
    }, [playerStore]);

    // Initialize the map only once
    useEffect(() => {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token || !mapContainerRef.current) {
            console.error("Mapbox token is not defined or container is missing");
            return;
        }

        mapboxgl.accessToken = token;

        const initializeMap = (lng: number, lat: number) => {
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current!,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [lng, lat],
                zoom: 15,
            });

            new mapboxgl.Marker()
                .setLngLat([lng, lat])
                .addTo(mapRef.current!);
        };

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => initializeMap(pos.coords.longitude, pos.coords.latitude),
                (err) => {
                    console.error('Error getting location:', err);
                    initializeMap(-74.0242, 40.6941);
                }
            );
        } else {
            initializeMap(-74.0242, 40.6941);
        }

        return () => {
            mapRef.current?.remove();
        };
    }, []);

    // Add rift markers reactively when data changes
    useEffect(() => {
        if (!mapRef.current || !data || !Array.isArray(data)) return;

        // Clear existing markers
        riftMarkersRef.current.forEach(marker => marker.remove());
        riftMarkersRef.current = [];

        data.forEach(rift => {
            const marker = new mapboxgl.Marker({ color: '#F44336' })
                .setLngLat([rift.longitude, rift.latitude])
                .addTo(mapRef.current!);

            marker.getElement().addEventListener('click', () => {
                setSelectedRift(rift);
                setIsModalOpen(true);
            });

            riftMarkersRef.current.push(marker);
        });
    }, [data]);

    return (
        <>
            <RiftModal open={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedRift} />
            <div
                id="map-container"
                className="h-screen w-full bg-gray-400"
                ref={mapContainerRef}
            />
        </>
    );
});


export default MapView;
