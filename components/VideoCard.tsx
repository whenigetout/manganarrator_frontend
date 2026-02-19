'use client';
import { useRef, useState, useEffect } from 'react';

interface VideoCardProps {
    src: string;
    thumb: string;
    minimal?: boolean; // ✅ new optional prop
    onClick?: () => void; // ✅ allow click handler to be passed
}

export default function VideoCard({ src, thumb, minimal = false, onClick }: VideoCardProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlayback = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.focus();
        }
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-[320px] cursor-pointer"
            onClick={minimal ? onClick : togglePlayback}
        >
            {minimal ? (
                <img
                    src={thumb}
                    alt="Video thumbnail"
                    className="w-full rounded-md border"
                />
            ) : (
                <video
                    ref={videoRef}
                    src={src}
                    poster={thumb}
                    className="w-full rounded-md border"
                    controls
                    tabIndex={0}
                    onClick={(e) => e.stopPropagation()}
                />
            )}
        </div>
    );
}
