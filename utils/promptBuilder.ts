import { CharacterAttributes } from '../types';

export function buildCharacterPrompt(attrs: CharacterAttributes): string {
  const parts: string[] = [];

  // Subject Core
  const genderTerm = attrs.gender === 'female' ? 'woman' : attrs.gender === 'male' ? 'man' : 'person';
  const ageDesc = `${attrs.age}-year-old ${attrs.ethnicity} ${genderTerm}`;
  const roleDesc = attrs.professionOrVibe ? `working as a ${attrs.professionOrVibe}` : '';
  parts.push(`Award-winning commercial portrait of a stunning ${ageDesc}${roleDesc ? `, ${roleDesc}` : ''}.`);

  // Physical Appearance & Face
  const physicalTraits = [
    attrs.bodyType ? `${attrs.bodyType} physique` : '',
    attrs.skinTone ? `${attrs.skinTone}` : '',
    attrs.facialFeatures ? `${attrs.facialFeatures}` : '',
    attrs.eyeColor ? `${attrs.eyeColor}` : ''
  ].filter(Boolean).join(', ');
  if (physicalTraits) {
    parts.push(`Facial & Physical Details: ${physicalTraits}.`);
  }

  // Hair & Makeup
  const hairAndMakeup = [
    attrs.hairStyle ? `Hairstyle: ${attrs.hairStyle}` : '',
    attrs.hairColor ? `Hair color: ${attrs.hairColor}` : '',
    attrs.makeupStyle ? `Makeup: ${attrs.makeupStyle}` : ''
  ].filter(Boolean).join('. ');
  if (hairAndMakeup) {
    parts.push(`${hairAndMakeup}.`);
  }

  // Expression & Mood
  if (attrs.expression) {
    parts.push(`Expression & Mood: ${attrs.expression}.`);
  }

  // Fashion Styling
  const fashion = [
    attrs.outfit ? `Wearing ${attrs.outfit}` : '',
    attrs.accessories ? `paired with ${attrs.accessories}` : ''
  ].filter(Boolean).join(' ');
  if (fashion) {
    parts.push(`Fashion Styling: ${fashion}.`);
  }

  // Environment & Atmosphere
  if (attrs.setting) {
    parts.push(`Environment & Setting: ${attrs.setting}.`);
  }

  // Lighting
  if (attrs.lighting) {
    parts.push(`Lighting: ${attrs.lighting}.`);
  }

  // Camera, Lens & Technical Quality
  if (attrs.cameraLens) {
    parts.push(`Cinematography: ${attrs.cameraLens}.`);
  }

  // Custom additions
  if (attrs.otherFeatures && attrs.otherFeatures.trim()) {
    parts.push(`Special Characteristic Details: ${attrs.otherFeatures.trim()}.`);
  }

  // Quality Boosters (optimized for Nano Banana Pro / Midjourney)
  parts.push(
    `Photorealistic, hyper-detailed skin texture with authentic pores and fine micro-details, authentic eye catchlights, ray-traced volumetric lighting, masterwork commercial photography, 8k resolution, shot on Hasselblad, pristine color balance, no plastic look.`
  );

  return parts.join(' ');
}

export function buildShortPromptSummary(attrs: CharacterAttributes): string {
  const genderTerm = attrs.gender === 'female' ? 'Nữ' : attrs.gender === 'male' ? 'Nam' : 'Khác';
  return `${genderTerm} • ${attrs.age} tuổi • ${attrs.ethnicity} • ${attrs.professionOrVibe || 'Nhà sáng tạo KOC'}`;
}