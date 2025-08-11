'use client'

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import {useSearchParams} from "next/navigation";
import {observer} from "mobx-react-lite";
import { usePlayerStore } from '@/store';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface District {
    name: string;
    bbox?: number[]; // [minLng, minLat, maxLng, maxLat]
    center: [number, number];
}

const QuestPage = observer(() => {
    const playerStore = usePlayerStore();
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [district, setDistrict] = useState<District | null>(null);

    // Example player position (lng, lat)
    const playerPosition: [number, number] = [playerStore.longitude, playerStore.latitude]; // Jakarta coordinates

    async function getDistrictByPosition(lng: number, lat: number): Promise<District | null> {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place,district,neighborhood&access_token=${mapboxgl.accessToken}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            const districtFeature = data.features.find((feature: any) =>
                feature.place_type.includes('district') ||
                feature.place_type.includes('place') ||
                feature.place_type.includes('neighborhood')
            );

            if (!districtFeature) return null;

            return {
                name: districtFeature.text,
                bbox: districtFeature.bbox,
                center: districtFeature.center,
            };
        } catch (error) {
            console.error('Error fetching district:', error);
            return null;
        }
    }

    useEffect(() => {
        if (map.current) return; // initialize map only once

        map.current = new mapboxgl.Map({
            container: mapContainer.current as HTMLElement,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: playerPosition,
            zoom: 12,
        });

        // Add zoom and rotation controls to the map.
        map.current.addControl(new mapboxgl.NavigationControl());

    }, []);

    useEffect(() => {
        if (!map.current) return;

        // Fetch district info and zoom/fit the map
        getDistrictByPosition(playerPosition[0], playerPosition[1]).then(districtData => {
            if (!districtData) return;

            setDistrict(districtData);

            if (districtData.bbox && districtData.bbox.length === 4) {
                const bounds = [
                    [districtData.bbox[0], districtData.bbox[1]],
                    [districtData.bbox[2], districtData.bbox[3]],
                ] as [[number, number], [number, number]];

                map.current!.fitBounds(bounds, { padding: 40, maxZoom: 14 });
            } else if (districtData.center) {
                map.current!.flyTo({ center: districtData.center, zoom: 14 });
            }
        });
    }, [map.current]);

    return (
        <div style={{ height: '100vh', position: 'relative' }}>
            <div ref={mapContainer} style={{ height: '100%' }} />
            {district && (
                <div style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: 'white',
                    padding: '8px 12px',
                    borderRadius: 4,
                    boxShadow: '0 0 5px rgba(0,0,0,0.2)'
                }}>
                    District: {district.name}
                </div>
            )}
        </div>
    );
});

export default QuestPage;
