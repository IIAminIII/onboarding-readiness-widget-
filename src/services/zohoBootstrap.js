/**
 * Registers the PageLoad handler and calls init() at page load, before React
 * mounts. Doing this inside a component effect means the handler is only
 * attached after the bundle parses and renders, which risks missing an event
 * the CRM has already sent.
 */
const state = {
  pageData: null,
  sdkAvailable: false,
  initStatus: "not started",
};

const listeners = new Set();

function emit() {
  const snapshot = getBootstrapState();
  listeners.forEach((listener) => listener(snapshot));
}

export function getBootstrapState() {
  return { ...state };
}

export function subscribeToPageLoad(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function bootstrapZoho() {
  const zoho = window.ZOHO;

  if (!zoho?.embeddedApp?.on || !zoho?.embeddedApp?.init) {
    state.initStatus = "SDK unavailable";
    console.error("Onboarding Readiness: Zoho Embedded App SDK is unavailable.");
    return;
  }

  state.sdkAvailable = true;

  zoho.embeddedApp.on("PageLoad", (pageData) => {
    console.log("Onboarding Readiness PageLoad data:", pageData);
    state.pageData = pageData;
    state.initStatus = "PageLoad received";
    emit();
  });

  try {
    const result = zoho.embeddedApp.init();
    state.initStatus = "init() called, awaiting PageLoad";
    console.log("Onboarding Readiness: embeddedApp.init() called.");

    if (result && typeof result.then === "function") {
      result.then(
        () => {
          // Only note the resolution; PageLoad may still be in flight.
          if (!state.pageData) state.initStatus = "init() resolved, no PageLoad yet";
          console.log("Onboarding Readiness: init() resolved.");
          emit();
        },
        (initError) => {
          state.initStatus = `init() rejected: ${initError?.message || initError}`;
          console.error("Onboarding Readiness: init() rejected.", initError);
          emit();
        },
      );
    } else {
      state.initStatus = "init() returned no promise, awaiting PageLoad";
    }
  } catch (initError) {
    state.initStatus = `init() threw: ${initError?.message || initError}`;
    console.error("Onboarding Readiness: init() threw.", initError);
  }

  emit();
}
