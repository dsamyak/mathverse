import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export function PostProcessing({ bloomIntensity = 1.2 }) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.7}
      />
      <Vignette offset={0.35} darkness={0.6} />
    </EffectComposer>
  )
}
