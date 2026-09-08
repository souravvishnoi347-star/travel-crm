/**
 * Dham Photo Gallery & AI Auto-Match Engine for Travel to Uttarakhand
 */

export interface DhamGalleryPhoto {
  id: string;
  url: string;
  caption: string;
  dham: "kedarnath" | "badrinath" | "gangotri" | "yamunotri" | "helicopter" | "haridwar_rishikesh" | "chopta_tungnath" | "himalayas" | "custom";
  dhamLabel: string;
  isDefault?: boolean;
  isCustom?: boolean;
  createdAt?: string;
}

export const INITIAL_DHAM_GALLERY: DhamGalleryPhoto[] = [
  // Kedarnath Dham
  {
    id: "dham-kedarnath-1",
    url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
    caption: "Shri Kedarnath Dham Temple & Snow Himalayan Peaks",
    dham: "kedarnath",
    dhamLabel: "Kedarnath Dham",
    isDefault: true
  },
  {
    id: "dham-kedarnath-2",
    url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    caption: "Kedarnath Valley & Holy Himalayan Pilgrim Trail",
    dham: "kedarnath",
    dhamLabel: "Kedarnath Dham",
    isDefault: true
  },

  // Kedarnath Helicopter Sector
  {
    id: "dham-heli-1",
    url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80",
    caption: "VIP Kedarnath Helicopter Shuttle & Aerial Darshan",
    dham: "helicopter",
    dhamLabel: "Helicopter Darshan",
    isDefault: true
  },

  // Badrinath Dham
  {
    id: "dham-badrinath-1",
    url: "https://images.unsplash.com/photo-1609766857329-a1789c09935f?auto=format&fit=crop&w=1200&q=80",
    caption: "Holy Shri Badrinath Ji Temple & Sacred Alaknanda River",
    dham: "badrinath",
    dhamLabel: "Badrinath Dham",
    isDefault: true
  },
  {
    id: "dham-badrinath-2",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    caption: "Neelkanth Snow Peak & Mana First Indian Village",
    dham: "badrinath",
    dhamLabel: "Badrinath Dham",
    isDefault: true
  },

  // Gangotri Dham
  {
    id: "dham-gangotri-1",
    url: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80",
    caption: "Holy Shri Gangotri Dham & Sacred Bhagirathi Valley",
    dham: "gangotri",
    dhamLabel: "Gangotri Dham",
    isDefault: true
  },

  // Yamunotri Dham
  {
    id: "dham-yamunotri-1",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    caption: "Sacred Shri Yamunotri Dham & Divya Shila Glacier",
    dham: "yamunotri",
    dhamLabel: "Yamunotri Dham",
    isDefault: true
  },

  // Haridwar & Rishikesh
  {
    id: "dham-haridwar-1",
    url: "https://images.unsplash.com/photo-1596766141386-f13ce38bb172?auto=format&fit=crop&w=1200&q=80",
    caption: "Har Ki Pauri World-Famous Maha Ganga Aarti",
    dham: "haridwar_rishikesh",
    dhamLabel: "Haridwar & Rishikesh",
    isDefault: true
  },
  {
    id: "dham-rishikesh-1",
    url: "https://images.unsplash.com/photo-1600100397608-f010f443906a?auto=format&fit=crop&w=1200&q=80",
    caption: "Rishikesh Divine Ganga Ghat & Ram Jhula Foothills",
    dham: "haridwar_rishikesh",
    dhamLabel: "Haridwar & Rishikesh",
    isDefault: true
  },

  // Chopta & Tungnath
  {
    id: "dham-chopta-1",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    caption: "Tungnath Mahadev - Highest Shiva Shrine & Chandrashila",
    dham: "chopta_tungnath",
    dhamLabel: "Chopta & Tungnath",
    isDefault: true
  }
];

export const DHAM_CATEGORIES = [
  { key: "all", label: "All Photos" },
  { key: "kedarnath", label: "Kedarnath" },
  { key: "badrinath", label: "Badrinath" },
  { key: "gangotri", label: "Gangotri" },
  { key: "yamunotri", label: "Yamunotri" },
  { key: "helicopter", label: "Helicopter" },
  { key: "haridwar_rishikesh", label: "Haridwar / Rishikesh" },
  { key: "chopta_tungnath", label: "Chopta / Tungnath" },
  { key: "custom", label: "Custom Uploads" },
];

/**
 * Load saved gallery from local storage or fallback to curated default
 */
export function getStoredDhamGallery(): DhamGalleryPhoto[] {
  if (typeof window === "undefined") return INITIAL_DHAM_GALLERY;
  try {
    const saved = localStorage.getItem("triloki_dham_gallery");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read dham gallery:", e);
  }
  return INITIAL_DHAM_GALLERY;
}

/**
 * Save updated gallery to local storage
 */
export function saveStoredDhamGallery(gallery: DhamGalleryPhoto[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("triloki_dham_gallery", JSON.stringify(gallery));
  } catch (e) {
    console.warn("Could not save dham gallery:", e);
  }
}

/**
 * AI Smart Dham Photo Matcher:
 * Analyzes itinerary text (title, route, dhams, activities) and automatically selects
 * the most relevant photos from the gallery for the detected Dhams/Destinations.
 */
export function pickDhamPhotosForItinerary(
  itinerary: {
    title?: string;
    subTitle?: string;
    dhamsSubtitle?: string;
    routeCovered?: string;
    overviewSummary?: string;
    days?: Array<{ route?: string; activities?: string[]; overnightStay?: string }>;
  },
  gallery: DhamGalleryPhoto[]
): { id: string; url: string; caption: string }[] {
  // Aggregate all itinerary content to search
  const textCorpus = [
    itinerary.title || "",
    itinerary.subTitle || "",
    itinerary.dhamsSubtitle || "",
    itinerary.routeCovered || "",
    itinerary.overviewSummary || "",
    ...(itinerary.days || []).flatMap(d => [d.route || "", ...(d.activities || []), d.overnightStay || ""])
  ].join(" ").toLowerCase();

  // Detect which destinations are mentioned
  const hasKedarnath = /kedarnath|kedar|shri kedar/i.test(textCorpus);
  const hasHelicopter = /helicopter|heli|helipad|phata|sersi|guptkashi heli/i.test(textCorpus);
  const hasBadrinath = /badrinath|badri|mana village|joshimath|alaknanda/i.test(textCorpus);
  const hasGangotri = /gangotri|bhagirathi|uttarkashi|harsil/i.test(textCorpus);
  const hasYamunotri = /yamunotri|yamuna|barkot|janki chatti|surya kund/i.test(textCorpus);
  const hasHaridwarRishi = /haridwar|rishikesh|ganga aarti|har ki pauri|ram jhula/i.test(textCorpus);
  const hasChopta = /chopta|tungnath|chandrashila|deoriatal/i.test(textCorpus);

  const selectedPhotos: { id: string; url: string; caption: string }[] = [];
  const addedIds = new Set<string>();

  const addPhotoFromDham = (dhamKey: string) => {
    // Custom uploaded photos first, then default
    const candidates = gallery.filter(p => p.dham === dhamKey && !addedIds.has(p.id));
    if (candidates.length > 0) {
      // Prioritize custom uploads
      const photo = candidates.find(p => p.isCustom) || candidates[0];
      selectedPhotos.push({
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        url: photo.url,
        caption: photo.caption
      });
      addedIds.add(photo.id);
    }
  };

  // Order of priority based on pilgrimage flow
  if (hasYamunotri) addPhotoFromDham("yamunotri");
  if (hasGangotri) addPhotoFromDham("gangotri");
  if (hasKedarnath) addPhotoFromDham("kedarnath");
  if (hasHelicopter) addPhotoFromDham("helicopter");
  if (hasChopta) addPhotoFromDham("chopta_tungnath");
  if (hasBadrinath) addPhotoFromDham("badrinath");
  if (hasHaridwarRishi) addPhotoFromDham("haridwar_rishikesh");

  // If fewer than 3 photos detected, supplement with top gallery photos
  if (selectedPhotos.length < 3) {
    for (const p of gallery) {
      if (!addedIds.has(p.id) && selectedPhotos.length < 3) {
        selectedPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          url: p.url,
          caption: p.caption
        });
        addedIds.add(p.id);
      }
    }
  }

  // Cap at 4 photos (optimal for A4 page 1 and page 3 layouts)
  return selectedPhotos.slice(0, 4);
}
