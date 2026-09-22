/* LAAU training-provider identity — 20260922-academy-brand-2.
 * Read-only branding for the organisation resolved through the training record.
 * No default Academy attribution, registry mutations or licence decisions.
 */

const ACADEMY_LEGACY_ID = "ORG-AAU-X7K4P2MN";
const ACADEMY_ID = "ORG-LAAU-X7K4P2MN";
const ACADEMY_IDS = Object.freeze([ACADEMY_LEGACY_ID, ACADEMY_ID]);
const ACADEMY_LOGO = "/credential-operations/credential-generator/assets/images/organizations/LAAU-Academy-Logo.png?v=20260922-academy-brand-2";
const ORGANIZATION_IDS = ["organizationId", "organization_id"];
const preparedProviders = new WeakMap();

function academyIdentity(organizationRecord) {
    const declaredId = readIdentityValue(organizationRecord.data,
        ORGANIZATION_IDS, "organisation ID");
    const legacyId = readIdentityValue(organizationRecord.data,
        ["legacy_organization_id"], "legacy organisation ID");
    const claimsAcademy = [organizationRecord.id, declaredId, legacyId].some(id => ACADEMY_IDS.includes(id));
    if (!claimsAcademy) return false;

    // Support only the two reviewed states of this one organisation. Logical
    // aliases must never redirect a third-party document to Academy branding.
    const validLegacy = organizationRecord.id === ACADEMY_LEGACY_ID &&
        declaredId === ACADEMY_LEGACY_ID && (!legacyId || legacyId === ACADEMY_LEGACY_ID);
    const validCanonical = organizationRecord.id === ACADEMY_ID &&
        declaredId === ACADEMY_ID && legacyId === ACADEMY_LEGACY_ID;
    if (!validLegacy && !validCanonical) {
        throw new Error("The Academy document identity or migration alias is inconsistent.");
    }
    return true;
}

export function readIdentityValue(record, fields, label, required = false) {
    const values = fields.flatMap(field => {
        const value = record?.[field];
        if (value === undefined || value === null || value === "") return [];
        if (typeof value !== "string" || !value.trim()) {
            throw new Error(`Invalid ${label} metadata. Review the registry record.`);
        }
        return [value.trim()];
    });
    if (new Set(values).size > 1) {
        throw new Error(`Conflicting ${label} metadata. Review the registry record.`);
    }
    if (!values.length && required) {
        throw new Error(`The ${label} is missing. Review the training record.`);
    }
    return values[0] || "";
}

export function safeProviderLogo(value, origin) {
    if (value === undefined || value === null || value === "") return "";
    if (typeof value !== "string" || !value.trim() || /[\s\\\u0000-\u001f\u007f]/.test(value)) {
        throw new Error("The training-provider logo URL is invalid.");
    }
    const localPath = value.startsWith("/") && !value.startsWith("//");
    if (!localPath && !value.startsWith("https://")) {
        throw new Error("The training-provider logo must use HTTPS or a same-origin path.");
    }
    const url = new URL(value, origin);
    if (url.protocol !== "https:" || url.username || url.password || url.hash ||
        (localPath && url.origin !== new URL(origin).origin)) {
        throw new Error("The training-provider logo URL is invalid.");
    }
    return url.href;
}

export function resolveProviderBranding(organizationRecord, origin) {
    if (!organizationRecord?.data || !organizationRecord.id) {
        throw new Error("The training organisation could not be resolved.");
    }
    const organization = organizationRecord.data;
    const organizationId = readIdentityValue(organization, ORGANIZATION_IDS, "organisation ID") || organizationRecord.id;
    const registeredName = readIdentityValue(organization,
        ["organizationName", "organization_name"], "organisation name", true);
    // The Academy is identified only by its confirmed document and ID pair.
    // This canonical display identity does not mutate the source record.
    if (academyIdentity(organizationRecord)) {
        return Object.freeze({ organizationId: ACADEMY_ID, name: "LAAU Academy", logoUrl: safeProviderLogo(ACADEMY_LOGO, origin) });
    }
    return Object.freeze({
        organizationId,
        name: registeredName,
        logoUrl: safeProviderLogo(organization.emblemUrl, origin)
    });
}

function uniqueRecords(records, label) {
    const matches = new Map(records.filter(Boolean).map(record => [record.id, record]));
    if (matches.size > 1) throw new Error(`More than one ${label} matches this training record.`);
    return [...matches.values()][0] || null;
}

async function linkedRecord(collection, id, aliases, getDocument, findRecords) {
    const direct = await getDocument(collection, id);
    const matches = [direct];
    for (const field of aliases) matches.push(...await findRecords(collection, field, id));
    const record = uniqueRecords(matches, collection);
    if (!record) throw new Error(`The linked ${collection} record could not be resolved.`);
    const declaredId = readIdentityValue(record.data, aliases, `${collection} ID`);
    if ((declaredId && declaredId !== id) || (!declaredId && record.id !== id)) {
        throw new Error(`The linked ${collection} identity is inconsistent.`);
    }
    return record;
}

async function organizationRecord(id, getDocument, findRecords) {
    if (!ACADEMY_IDS.includes(id)) {
        return linkedRecord("trainingOrganizations", id, ORGANIZATION_IDS, getDocument, findRecords);
    }
    const matches = [];
    for (const academyId of ACADEMY_IDS) {
        matches.push(await getDocument("trainingOrganizations", academyId));
        for (const field of [...ORGANIZATION_IDS, "legacy_organization_id"]) {
            matches.push(...await findRecords("trainingOrganizations", field, academyId));
        }
    }
    const record = uniqueRecords(matches, "trainingOrganizations");
    if (!record) throw new Error("The linked trainingOrganizations record could not be resolved.");
    if (!academyIdentity(record)) {
        throw new Error("The Academy organisation could not be resolved.");
    }
    return record;
}

export async function resolveTrainingProviderContext({ credential, getDocument, findRecords, origin }) {
    const batchId = readIdentityValue(credential, ["batch_id", "batchId"], "batch ID");
    const batchName = readIdentityValue(credential, ["batch_name", "batchName"], "batch name");
    const batchCode = readIdentityValue(credential, ["batch_code", "batchCode"], "batch code");
    let batch = batchId ? await getDocument("batches", batchId) : null;
    if (!batch) {
        const matches = [];
        if (batchName) matches.push(...await findRecords("batches", "batch_name", batchName));
        if (batchCode) matches.push(...await findRecords("batches", "batch_code", batchCode));
        batch = uniqueRecords(matches, "batch");
    }
    if (!batch) throw new Error("The credential's training batch could not be resolved.");
    const trainerId = readIdentityValue(batch.data, ["trainerId", "trainer_id"], "trainer ID", true);
    const trainer = await linkedRecord("trainerRegistry", trainerId,
        ["trainerId", "trainer_id"], getDocument, findRecords);
    readIdentityValue(trainer.data, ["trainerName", "trainer_name"], "trainer name", true);
    const organizationId = readIdentityValue(trainer.data, ORGANIZATION_IDS, "organisation ID", true);
    const organization = await organizationRecord(organizationId, getDocument, findRecords);
    return Object.freeze({
        batch: batch.data,
        trainer: trainer.data,
        organization: organization.data,
        provider: resolveProviderBranding(organization, origin)
    });
}

export function registerProviderRender(element, credentialId, provider) {
    if (!element || !credentialId || !provider?.organizationId || !provider.name) {
        throw new Error("The training-provider preview is not ready.");
    }
    preparedProviders.set(element, Object.freeze({ credentialId, ...provider }));
}

export function assertProviderRender(element, credentialId) {
    const provider = preparedProviders.get(element);
    if (!provider || provider.credentialId !== credentialId) {
        throw new Error("The training-provider identity has not been verified for this preview.");
    }
    const name = element.querySelector("#trainercertOrganizationName");
    const logo = element.querySelector("#trainercertOrganizationEmblem");
    if (!name || name.textContent !== provider.name || !logo ||
        (provider.logoUrl ? (logo.src !== provider.logoUrl || logo.hidden || logo.style.display === "none") :
            (Boolean(logo.getAttribute("src")) || !logo.hidden || logo.style.display !== "none"))) {
        throw new Error("The training-provider name or logo changed. Reload the credential preview.");
    }
    return () => {
        if (preparedProviders.get(element) !== provider) {
            throw new Error("The training-provider selection changed during export.");
        }
        assertProviderRender(element, credentialId);
    };
}
