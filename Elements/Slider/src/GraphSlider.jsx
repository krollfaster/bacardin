import React, { useState, useRef, useEffect, useMemo } from 'react';

const GraphSlider = () => {
    const [hoverX, setHoverX] = useState(183); // Start in middle
    const containerRef = useRef(null);
    const pathRef = useRef(null);

    // The extracted path data
    const pathData = "M3.39622 186.948H14.5303C15.2314 186.948 15.8936 186.626 16.3265 186.074L22.9168 177.677C23.7626 176.599 25.3603 176.504 26.3284 177.473L41.5721 192.734C42.0003 193.163 42.5815 193.404 43.1875 193.404H59.2312C59.7142 193.404 60.1848 193.25 60.5752 192.966L67.1611 188.171C68.1134 187.478 69.4369 187.622 70.2166 188.506L77.3631 196.6C78.1747 197.519 79.5674 197.633 80.5177 196.858L104.823 177.037C105.774 176.262 107.166 176.376 107.978 177.296L114.65 184.853C115.606 185.935 117.314 185.87 118.184 184.718L128.222 171.429C128.526 171.026 128.956 170.736 129.443 170.603L145.259 166.284C145.988 166.085 146.572 165.538 146.817 164.823L153.829 144.402C154.053 143.749 154.56 143.233 155.208 142.998L166.644 138.834C167.184 138.638 167.629 138.245 167.893 137.734L172.184 129.402C173.018 127.782 175.32 127.744 176.208 129.335L187.56 149.68C188.121 150.686 189.343 151.116 190.41 150.685L207.469 143.784C208.115 143.523 208.607 142.981 208.803 142.312L221.178 100.267C221.522 99.098 222.723 98.4051 223.907 98.6925L233.424 101.002C234.412 101.242 235.44 100.8 235.945 99.9176L244.91 84.2513C245.585 83.071 247.136 82.7391 248.236 83.5395L252.888 86.9272C254.02 87.7515 255.621 87.3718 256.262 86.1268L256.756 85.1683C257.513 83.698 259.534 83.4954 260.568 84.7861L271.18 98.0327C272.328 99.4649 274.61 99.0268 275.146 97.2716L286.424 60.3201C286.827 59.0008 288.298 58.337 289.554 58.9083L303.47 65.2413C304.34 65.6371 305.364 65.4495 306.037 64.7711L318.656 52.0495C319.085 51.6173 319.668 51.3741 320.277 51.3741H338.657C339.679 51.3741 340.576 52.053 340.854 53.0362L346.821 74.1388C347.347 75.9985 349.802 76.4046 350.899 74.8132L362.604 57.83";

    // Pre-calculate X -> Y lookup table
    const points = useMemo(() => {
        if (!pathRef.current) return [];
        const path = pathRef.current;
        const len = path.getTotalLength();
        const p = [];
        const step = 0.5; // Precision
        for (let i = 0; i <= len; i += step) {
            const point = path.getPointAtLength(i);
            // We want to map X to Y. Since X is monotonic, we can just push.
            // But we might have multiple points for same X (unlikely for this graph) or gaps.
            // A simple array where index = rounded X is fastest.
            p.push({ x: point.x, y: point.y });
        }
        return p;
    }, [pathRef.current]); // Re-run if pathRef.current changes

    // Find Y for a given X
    const getYForX = (x) => {
        if (points.length === 0) return 0;
        // Find closest point by X
        // Since points are roughly sorted by X, we can find it easily.
        // For now, simple search or just mapping if we built a direct lookup.
        // Let's just find the closest.
        const closest = points.reduce((prev, curr) => {
            return (Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev);
        });
        return closest.y;
    };

    const handlePointerDown = (e) => {
        setIsDragging(true);
        updateValue(e);
    };

    const handlePointerMove = (e) => {
        updateValue(e);
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
    };

    const handlePointerLeave = () => {
        // Optional: Reset or hide, but for now let's just leave it at last position or do nothing
        // The user didn't specify behavior on leave, so keeping it simple.
    };

    const updateValue = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const clampedX = Math.max(0, Math.min(width, x));
        setHoverX(clampedX);
    };

    // Derived state
    const currentY = getYForX(hoverX);
    const percentage = (hoverX / 366) * 100;

    // Time calculation
    const totalMinutes = 8 * 60 + (percentage / 100) * 12 * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours;
    const timeString = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;

    const fillPathData = pathData + " L 366 213 L 0 213 Z";

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '366px',
                height: '213px',
                cursor: 'none', // Hide cursor as per request
                userSelect: 'none',
                touchAction: 'none'
            }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
        >
            {/* Hidden path for calculation */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <path ref={pathRef} d={pathData} />
            </svg>

            {/* Gradients Definition */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
                        <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                    </linearGradient>
                    <linearGradient id="grayGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.1)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Gray Gradient Fill (Right side) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                clipPath: `inset(0 0 0 ${percentage}%)`,
                pointerEvents: 'none'
            }}>
                <svg width="366" height="213" viewBox="0 0 366 213" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d={fillPathData} fill="url(#grayGradient)" />
                </svg>
            </div>

            {/* Blue Gradient Fill (Left side) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                clipPath: `inset(0 ${100 - percentage}% 0 0)`,
                pointerEvents: 'none'
            }}>
                <svg width="366" height="213" viewBox="0 0 366 213" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d={fillPathData} fill="url(#blueGradient)" />
                </svg>
            </div>

            {/* Background Graph Stroke (Gray) */}
            <svg
                width="366"
                height="213"
                viewBox="0 0 366 213"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                <path
                    d={pathData}
                    stroke="#333"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            {/* Foreground Graph Stroke (Blue) - Clipped */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                clipPath: `inset(0 ${100 - percentage}% 0 0)`,
                pointerEvents: 'none',
                // transition: 'none' // Instant update is better for hover
            }}>
                <svg
                    width="366"
                    height="213"
                    viewBox="0 0 366 213"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d={pathData}
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            {/* Vertical Line */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: '1px',
                    backgroundColor: '#444', // Dark gray line
                    transform: `translateX(${hoverX}px)`,
                    pointerEvents: 'none'
                }}
            />

            {/* Label */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: `translate(calc(${hoverX}px - 50%), -40px)`,
                    backgroundColor: '#333',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
            >
                {timeString}
            </div>

            {/* Slider Dot */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '14px',
                    height: '14px',
                    backgroundColor: '#007AFF', // Blue fill
                    border: '2px solid white', // White border
                    borderRadius: '50%',
                    transform: `translate(calc(${hoverX}px - 50%), calc(${currentY}px - 50%))`,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};

export default GraphSlider;
