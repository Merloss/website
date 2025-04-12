import mediumZoom, { type Zoom } from "medium-zoom";

export default defineNuxtPlugin((nuxtApp) => {
	const selector = ".image-zoomable";
	let zoomInstance: Zoom | null = null;

	const initOrReattachZoom = async () => {
		await nextTick();
		try {
			if (zoomInstance) {
				zoomInstance.detach(selector);
			}
			zoomInstance = mediumZoom(selector, {
				background: "var(--zoom-background)",
			});
		} catch (error) {
			console.error("Error re-attaching medium-zoom:", error);
		}
	};

	onNuxtReady(() => {
		initOrReattachZoom();
	});

	nuxtApp.hook("page:transition:finish", initOrReattachZoom);

	nuxtApp.provide("mediumZoom", () => zoomInstance);
});
