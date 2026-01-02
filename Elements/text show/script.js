class FractionalSlider {
    constructor() {
        this.sliderContainer = document.getElementById('sliderTrack');
        this.sliderContent = document.getElementById('sliderContent');
        this.valueDisplay = document.getElementById('valueDisplay');

        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.offset = 0;
        this.currentValue = 0;
        this.previousValue = 0;

        // Configuration
        this.minValue = -70;
        this.maxValue = 70;
        this.majorStep = 5;
        this.minorSteps = 4; // 4 minor ticks between major ticks
        this.pixelsPerUnit = 20; // Pixels per value unit

        // Sound
        this.audioContext = null;
        this.lastSoundTime = 0;
        this.soundThrottle = 50; // ms between sounds

        this.init();
    }

    init() {
        this.generateTicks();
        this.setupEventListeners();
        this.updateValue(0);

        // Initialize Web Audio API on first user interaction
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    playTickSound() {
        if (!this.audioContext) return;

        const now = Date.now();
        if (now - this.lastSoundTime < this.soundThrottle) return;
        this.lastSoundTime = now;

        // Resume audio context if suspended (for browsers that require user interaction)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Create a subtle tick sound using oscillator
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Short, high-pitched click
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        // Quick fade out
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.02);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.02);
    }

    updateTickColors() {
        const tickGroups = this.sliderContent.querySelectorAll('.tick-group');

        tickGroups.forEach(group => {
            const tickValue = parseFloat(group.dataset.value);
            const tick = group.querySelector('.tick');
            const label = group.querySelector('.tick-label');

            // Skip if this is a minor tick (no value)
            if (isNaN(tickValue)) {
                // For minor ticks, estimate based on position
                const allGroups = Array.from(tickGroups);
                const index = allGroups.indexOf(group);
                const prevMajor = allGroups.slice(0, index).reverse().find(g => !isNaN(parseFloat(g.dataset.value)));
                const nextMajor = allGroups.slice(index + 1).find(g => !isNaN(parseFloat(g.dataset.value)));

                if (prevMajor && nextMajor) {
                    const prevValue = parseFloat(prevMajor.dataset.value);
                    const nextValue = parseFloat(nextMajor.dataset.value);
                    const prevIndex = allGroups.indexOf(prevMajor);
                    const nextIndex = allGroups.indexOf(nextMajor);
                    const ratio = (index - prevIndex) / (nextIndex - prevIndex);
                    const estimatedValue = prevValue + (nextValue - prevValue) * ratio;

                    // Highlight if between 0 and current value
                    if ((this.currentValue >= 0 && estimatedValue >= 0 && estimatedValue <= this.currentValue) ||
                        (this.currentValue < 0 && estimatedValue <= 0 && estimatedValue >= this.currentValue)) {
                        tick?.classList.add('highlighted');
                    } else {
                        tick?.classList.remove('highlighted');
                    }
                }
                return;
            }

            // Highlight ticks between 0 and current value
            const shouldHighlight = (this.currentValue >= 0 && tickValue >= 0 && tickValue <= this.currentValue) ||
                (this.currentValue < 0 && tickValue <= 0 && tickValue >= this.currentValue);

            if (shouldHighlight) {
                tick?.classList.add('highlighted');
                label?.classList.add('highlighted');
            } else {
                tick?.classList.remove('highlighted');
                label?.classList.remove('highlighted');
            }
        });
    }

    generateTicks() {
        this.sliderContent.innerHTML = '';

        const totalRange = this.maxValue - this.minValue;
        const majorTicks = totalRange / this.majorStep + 1;

        for (let i = 0; i < majorTicks; i++) {
            const value = this.minValue + (i * this.majorStep);

            // Create major tick
            const majorGroup = this.createTickGroup(value, true);
            this.sliderContent.appendChild(majorGroup);

            // Create minor ticks (except after last major tick)
            if (i < majorTicks - 1) {
                for (let j = 1; j <= this.minorSteps; j++) {
                    const minorGroup = this.createTickGroup(null, false);
                    this.sliderContent.appendChild(minorGroup);
                }
            }
        }
    }

    createTickGroup(value, isMajor) {
        const group = document.createElement('div');
        group.className = 'tick-group';
        group.style.width = `${this.pixelsPerUnit}px`;
        group.dataset.value = value !== null ? value : '';

        const tick = document.createElement('div');
        tick.className = isMajor ? 'tick major' : 'tick minor';
        group.appendChild(tick);

        if (isMajor && value !== null) {
            const label = document.createElement('div');
            label.className = 'tick-label';
            label.textContent = value;
            group.appendChild(label);
        }

        return group;
    }

    setupEventListeners() {
        // Mouse events
        this.sliderContainer.addEventListener('mousedown', this.handleStart.bind(this));
        document.addEventListener('mousemove', this.handleMove.bind(this));
        document.addEventListener('mouseup', this.handleEnd.bind(this));

        // Touch events
        this.sliderContainer.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleEnd.bind(this));

        // Wheel event for scroll
        this.sliderContainer.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

        // Prevent text selection
        this.sliderContainer.addEventListener('selectstart', (e) => e.preventDefault());
    }

    handleStart(e) {
        this.isDragging = true;
        this.sliderContent.classList.add('dragging');

        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        this.startX = clientX - this.offset;

        // Initialize audio context on first interaction
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    handleMove(e) {
        if (!this.isDragging) return;

        e.preventDefault();

        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        this.currentX = clientX - this.startX;
        this.offset = this.currentX;

        this.updateSliderPosition();
        this.calculateValue();
    }

    handleEnd(e) {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.sliderContent.classList.remove('dragging');
    }

    handleWheel(e) {
        e.preventDefault();

        // Scroll sensitivity
        const delta = e.deltaY * 0.5;
        this.offset -= delta;
        this.currentX = this.offset;

        this.updateSliderPosition();
        this.calculateValue();
    }

    updateSliderPosition() {
        this.sliderContent.style.transform = `translateX(calc(-50% + ${this.offset}px))`;
        this.updateTickColors();
    }

    calculateValue() {
        // Calculate value based on offset
        const value = -(this.offset / this.pixelsPerUnit);
        const roundedValue = Math.round(value * 10) / 10; // Round to 1 decimal place

        // Clamp value within bounds
        const clampedValue = Math.max(this.minValue, Math.min(this.maxValue, roundedValue));

        if (Math.abs(this.currentValue - clampedValue) >= 0.1) {
            this.previousValue = this.currentValue;
            this.currentValue = clampedValue;
            this.updateValue(this.currentValue);
            this.playTickSound();
        }
    }

    updateValue(value) {
        this.valueDisplay.textContent = value.toFixed(1);
    }
}

// Initialize the slider when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FractionalSlider();
});
