/* LAAU certificate preview fitting — 20260922-signature-2
   Scale only the visible preview. The separate PDF capture surfaces keep
   their original dimensions, styles and publication behaviour. */

const previewControllers = new WeakMap();
const visiblePreviews = Object.freeze({
    certificatePreview: ".certificate-template",
    renderTrainerCertificatePreview: ".trainer-certificate-template"
});

export function fitCredentialPreview(container) {
    if (!container) return null;

    const selector = visiblePreviews[container.id];
    if (!selector || container.closest("#pdfRenderContainer")) {
        throw new Error("Certificate fitting requires a visible preview container.");
    }

    if (previewControllers.has(container)) {
        return previewControllers.get(container);
    }

    let scheduledFrame = 0;
    let stopped = false;

    function update() {
        scheduledFrame = 0;
        if (stopped) return;

        const canvas = container.querySelector(selector);
        if (!canvas) {
            container.classList.remove("laau-responsive-preview");
            return;
        }

        container.classList.add("laau-responsive-preview");

        let frame = canvas.parentElement;
        if (!frame || !frame.hasAttribute("data-laau-preview-frame")) {
            frame = document.createElement("div");
            frame.className = "laau-preview-frame";
            frame.setAttribute("data-laau-preview-frame", "");
            canvas.before(frame);
            frame.appendChild(canvas);
        }

        const styles = window.getComputedStyle(container);
        const horizontalPadding =
            (parseFloat(styles.paddingLeft) || 0) +
            (parseFloat(styles.paddingRight) || 0);
        const availableWidth = Math.max(0, container.clientWidth - horizontalPadding);

        // A hidden initial view is measured again when ResizeObserver reports
        // its visible size. Never infer the viewport width for a hidden card.
        if (!availableWidth) return;

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        if (!width || !height) return;

        const scale = Math.min(1, availableWidth / width);
        const frameWidth = `${width * scale}px`;
        const frameHeight = `${Math.ceil(height * scale)}px`;
        const transform = `scale(${scale})`;

        // Unchanged assignments are skipped so observing the container's
        // height does not create a resize feedback loop.
        if (frame.style.width !== frameWidth) frame.style.width = frameWidth;
        if (frame.style.height !== frameHeight) frame.style.height = frameHeight;
        if (canvas.style.transform !== transform) canvas.style.transform = transform;
    }

    function schedule() {
        if (!stopped && !scheduledFrame) {
            scheduledFrame = window.requestAnimationFrame(update);
        }
    }

    const mutations = new MutationObserver(schedule);
    mutations.observe(container, { childList: true });

    const resize = typeof ResizeObserver === "function"
        ? new ResizeObserver(schedule)
        : null;
    resize?.observe(container);
    window.addEventListener("resize", schedule, { passive: true });

    const controller = Object.freeze({
        refresh: schedule,
        disconnect() {
            if (stopped) return;
            stopped = true;
            mutations.disconnect();
            resize?.disconnect();
            window.removeEventListener("resize", schedule);
            if (scheduledFrame) window.cancelAnimationFrame(scheduledFrame);
            scheduledFrame = 0;
            previewControllers.delete(container);
        }
    });

    previewControllers.set(container, controller);
    schedule();
    return controller;
}
