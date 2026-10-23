/**
 * Compatibility name retained for existing imports. Preserve product identities
 * and quoted dialogue exactly; rewriting brands changes the requested output.
 * Flow remains responsible for validating generation requests.
 */
export function sanitizePolicySafePrompt(rawPrompt: string): string {
  return rawPrompt.trim();
}

export function enhanceImagePrompt(basePrompt: string, styleTitle?: string): string {
  const aesthetic = styleTitle ? `Aesthetic style: ${styleTitle}.` : '';
  const safePrompt = sanitizePolicySafePrompt(basePrompt);
  const boosters = [
    'Natural commercial presenter portrait',
    'Hyper-detailed natural skin texture with visible micro-pores, soft studio lighting',
    '8k commercial master photography, authentic eye catchlights',
    'Anatomically accurate hands and natural grip on the product',
    'Pure visual image, zero text, no typography, no watermark'
  ].join(', ');

  return `${safePrompt}. ${aesthetic} ${boosters}.`;
}

export function enhanceMotionVideoPrompt(baseMotionPrompt: string, cameraDynamics?: string): string {
  const camera = cameraDynamics ? `Camera movement: ${cameraDynamics}.` : 'Smooth steadycam motion with gentle cinematic tracking.';
  const safeMotion = sanitizePolicySafePrompt(baseMotionPrompt);
  const motionBoosters = [
    'Seamless temporal consistency across all frames',
    'Fluid natural organic human biomechanics and body gestures',
    'Stable face geometry without morphing, warping or jitter',
    'Authentic natural hair and fabric physics',
    'Crisp frame rate, cinematic motion blur',
    'Clean raw cinematography, absolutely no text, no subtitles on screen'
  ].join(', ');

  return `${safeMotion}. ${camera} ${motionBoosters}.`;
}