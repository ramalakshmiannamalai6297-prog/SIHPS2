# Optional local model cache

The service tries the configured Hugging Face DistilBERT checkpoint only when the model dependencies are installed and the checkpoint is already available locally. Set `SIH_MODEL_NAME` to a local model directory or cached model ID. To permit a first-time download, explicitly set `SIH_ALLOW_MODEL_DOWNLOAD=true` before starting the service. Without a usable model, analysis remains available through the clearly labeled prototype rule-based fallback.
