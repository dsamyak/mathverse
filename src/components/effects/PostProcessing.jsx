// PostProcessing effects stub — returns null to avoid the @react-three/postprocessing
// peer dependency chain (postprocessing lib + fiber v9 conflict).
// Visual bloom/vignette can be re-enabled once dependencies are stable.
export function PostProcessing({ bloomIntensity = 1.2 }) {
  return null
}
