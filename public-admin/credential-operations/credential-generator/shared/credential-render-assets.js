/*
 * LAAU credential export prerequisites — 20260922-seal-1.
 * Fail before upload when a render is stale or a required image is unavailable.
 * Each export uses a new Storage object; existing published files stay intact.
 */

const SEAL_PATH =
    "/credential-operations/credential-generator/assets/images/LAAU-Seal.png";
const SEAL_VERSION = "?v=20260922-seal-1";
const RENDER_TIMEOUT_MS = 15000;

function withTimeout(promise, message) {
    let timer;
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            timer = window.setTimeout(
                () => reject(new Error(message)), RENDER_TIMEOUT_MS
            );
        })
    ]).finally(() => window.clearTimeout(timer));
}

function isNotRendered(element) {
    for (let current = element; current; current = current.parentElement) {
        if (current.hidden || window.getComputedStyle(current).display === "none") {
            return true;
        }
    }
    return false;
}

function renderedImages(element) {
    return Array.from(element.querySelectorAll("img")).filter(image =>
        image.id !== "trainercertOrganizationEmblem" ||
        Boolean(image.getAttribute("src")) || !isNotRendered(image)
    );
}

async function waitForRenderedImage(image) {
    if (!image.getAttribute("src")) {
        throw new Error("A credential image has no source. Reload the preview.");
    }

    if (typeof image.decode === "function") {
        await withTimeout(
            image.decode(),
            "A credential image did not finish loading. Reload the preview."
        );
    } else if (!image.complete) {
        await new Promise((resolve, reject) => {
            let timer;
            const cleanup = () => {
                image.removeEventListener("load", onLoad);
                image.removeEventListener("error", onError);
                window.clearTimeout(timer);
            };
            const onLoad = () => { cleanup(); resolve(); };
            const onError = () => {
                cleanup();
                reject(new Error("A credential image could not load. Reload the preview."));
            };
            image.addEventListener("load", onLoad, { once: true });
            image.addEventListener("error", onError, { once: true });
            timer = window.setTimeout(onError, RENDER_TIMEOUT_MS);
            if (image.complete) {
                if (image.naturalWidth > 0 && image.naturalHeight > 0) onLoad();
                else onError();
            }
        });
    }

    if (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
        throw new Error("A credential image could not load. Reload the preview.");
    }
}

export async function prepareCredentialRender({
    element,
    credentialId,
    credentialIdSelector,
    getCurrentCredentialId,
    getCurrentElement
}) {
    const images = renderedImages(element);
    const imageSources = images.map(image => image.src);
    const seals = images.filter(image => image.hasAttribute("data-laau-seal"));
    if (seals.length !== 1 || isNotRendered(seals[0])) {
        throw new Error("The approved LAAU seal is missing from the preview.");
    }
    const sealUrl = new URL(seals[0].src, window.location.href);
    if (
        sealUrl.origin !== window.location.origin ||
        sealUrl.pathname !== SEAL_PATH ||
        sealUrl.search !== SEAL_VERSION ||
        sealUrl.hash
    ) {
        throw new Error("The preview does not use the approved LAAU seal.");
    }

    const assertCurrent = (requireLoaded = true) => {
        const renderedId = String(
            element.querySelector(credentialIdSelector)?.textContent || ""
        ).trim();
        if (
            !credentialId || renderedId !== credentialId ||
            getCurrentCredentialId() !== credentialId ||
            getCurrentElement() !== element || !element.isConnected
        ) {
            throw new Error("The selected credential changed or its preview is not ready. Reload the credential.");
        }
        const currentImages = renderedImages(element);
        if (
            currentImages.length !== images.length || isNotRendered(seals[0]) ||
            images.some((image, index) =>
                currentImages[index] !== image || image.src !== imageSources[index] ||
                (requireLoaded && (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0))
            )
        ) {
            throw new Error("The credential images changed during export. Reload the preview.");
        }
    };

    assertCurrent(false);
    if (document.fonts?.ready) {
        await withTimeout(
            document.fonts.ready,
            "Credential fonts did not finish loading. Reload the preview."
        );
    }
    await Promise.all(images.map(waitForRenderedImage));
    assertCurrent();
    return assertCurrent;
}

export function buildVersionedAssetPath(credentialId, assetDirectory, fileName) {
    const safeSegment = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
    if (![credentialId, assetDirectory, fileName].every(value =>
        typeof value === "string" && safeSegment.test(value)
    )) {
        throw new Error("Invalid credential asset path.");
    }
    const secureCrypto = window.crypto;
    let versionId;
    if (typeof secureCrypto?.randomUUID === "function") {
        versionId = secureCrypto.randomUUID();
    } else if (typeof secureCrypto?.getRandomValues === "function") {
        const bytes = new Uint8Array(16);
        secureCrypto.getRandomValues(bytes);
        versionId = Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
    } else {
        throw new Error("Secure random generation is unavailable. Use HTTPS and reload.");
    }
    return `credential-assets/${credentialId}/${assetDirectory}/versions/${versionId}/${fileName}`;
}
