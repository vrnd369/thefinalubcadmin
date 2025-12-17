import {
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { validateAndCompressDocument } from '../../utils/firestoreCompression';
import { isExistingUser, markUserAsExisting } from '../../utils/userCache';
import starImage from '../../assets/star.png';

const CAREERS_COLLECTION = 'careersPage';
const CAREERS_DOC_ID = 'default';

export const getCareersConfig = async () => {
  try {
    const useCache = isExistingUser();
    const ref = doc(db, CAREERS_COLLECTION, CAREERS_DOC_ID);
    // Use cache for existing users, server for new users
    const snap = useCache ? await getDoc(ref) : await getDocFromServer(ref);
    if (!snap.exists()) return null;
    // Mark user as existing after first successful fetch
    if (!useCache) {
      markUserAsExisting();
    }
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    console.error('Error fetching careers config:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for careers config
 * @param {(config: Object|null) => void} callback - Callback function that receives config updates
 * @param {(error: Error) => void} [onError] - Optional error callback
 * @returns {() => void} Unsubscribe function
 */
export const subscribeCareersConfig = (callback, onError) => {
  try {
    const ref = doc(db, CAREERS_COLLECTION, CAREERS_DOC_ID);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          callback({ id: snap.id, ...snap.data() });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error subscribing to careers config:', error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error('Error initializing careers config subscription:', error);
    if (onError) onError(error);
    return () => {};
  }
};

export const hasCareersConfig = async () => {
  try {
    const useCache = isExistingUser();
    const ref = doc(db, CAREERS_COLLECTION, CAREERS_DOC_ID);
    // Use cache for existing users, server for new users
    const snap = useCache ? await getDoc(ref) : await getDocFromServer(ref);
    return snap.exists();
  } catch (error) {
    console.error('Error checking careers config:', error);
    return false;
  }
};

export const saveCareersConfig = async (config) => {
  try {
    const now = new Date().toISOString();
    const payload = {
      ...config,
      updatedAt: now
    };
    if (!config.createdAt) {
      payload.createdAt = now;
    }

    const compressed = await validateAndCompressDocument(payload);
    const ref = doc(db, CAREERS_COLLECTION, CAREERS_DOC_ID);
    await setDoc(ref, compressed, { merge: true });
  } catch (error) {
    console.error('Error saving careers config:', error);
    throw error;
  }
};

export const importCareersFromLive = async () => {
  const defaultConfig = {
    pageTitle: 'Careers - UBC | United Brothers Company',
    hero: {
      badgeText: '★ Opportunity',
      title: 'Life at\nUnited Brothers',
      subtitle:
        'At the United Brothers Company, we are more than just a team; we are a family of innovators, creators, and professionals.'
    },
    whySection: {
      badgeText: '★ Why',
      title: 'Why Join Us?',
      cards: [
        {
          id: 'why-1',
          title: 'Nurture Your\nPotential',
          text:
            'We invest in our people through continuous learning and development opportunities, empowering you to grow both professionally and personally.',
          icon: starImage
        },
        {
          id: 'why-2',
          title: 'A Culture\nof Integrity',
          text:
            'Our core values of purity, quality, and trust are reflected in every aspect of our work, from our products to our people.',
          icon: starImage
        },
        {
          id: 'why-3',
          title: 'Make an\nImpact',
          text:
            'Be a part of a company that is shaping the future of the FMCG industry and making a positive difference in households worldwide.',
          icon: starImage
        }
      ]
    },
    openingsSection: {
      badgeText: '★ Join Us',
      title: 'Our Openings',
      jobs: [
        {
          id: 'job-community-manager',
          title: 'Community Manager',
          date: '10th Mar 2025',
          blurb:
            "We're looking for a warm, people-first individual to lead member engagement, curate events, and cultivate a welcoming coworking culture.",
          description:
            "As a Community Manager, you'll be the heart of our coworking space, fostering connections and creating an inclusive environment. Your role involves organizing networking events, managing member relationships, and ensuring our community thrives. You'll work closely with members to understand their needs, facilitate introductions, and maintain the vibrant culture that makes our space unique. This position requires excellent communication skills, empathy, and a passion for bringing people together.",
          enabled: true,
          order: 1
        },
        {
          id: 'job-operations-coordinator',
          title: 'Space Operations Coordinator',
          date: '10th Mar 2025',
          blurb:
            'Support the day-to-day operations of our space—keeping things running smoothly, maintaining high standards, and ensuring an excellent member experience.',
          description:
            'The Space Operations Coordinator is responsible for maintaining the physical space and ensuring everything operates seamlessly. You\'ll manage facility maintenance, coordinate with vendors, oversee cleaning schedules, and handle any operational issues that arise. Your attention to detail and proactive approach will ensure our members always have a clean, functional, and welcoming workspace. This role requires strong organizational skills, problem-solving abilities, and a commitment to excellence in every aspect of space management.',
          enabled: true,
          order: 2
        },
        {
          id: 'job-membership-associate',
          title: 'Membership Experience Associate',
          date: '10th Mar 2025',
          blurb:
            "Be the first point of contact for our members—whether onboarding new joiners or handling queries, you'll help everyone feel right at home.",
          description:
            "As a Membership Experience Associate, you'll be the friendly face that greets members daily and helps them navigate their coworking journey. Your responsibilities include conducting tours for prospective members, managing the onboarding process, handling member inquiries, and ensuring everyone feels supported. You'll maintain member records, process memberships, and serve as a liaison between members and management. This role is perfect for someone who is personable, organized, and dedicated to creating exceptional experiences from first contact to ongoing support.",
          enabled: true,
          order: 3
        },
        {
          id: 'job-events-executive',
          title: 'Events & Partnerships Executive',
          date: '10th Mar 2025',
          blurb:
            'Plan and deliver events that bring our community together, while building relationships with local partners to enrich our member offerings.',
          description:
            'The Events & Partnerships Executive plays a crucial role in building our community through strategic events and valuable partnerships. You\'ll plan and execute a diverse calendar of events including workshops, networking sessions, and social gatherings. Additionally, you\'ll identify and cultivate partnerships with local businesses, service providers, and organizations to enhance member benefits. This position requires creativity, strong relationship-building skills, and the ability to manage multiple projects simultaneously while ensuring each event delivers value to our community.',
          enabled: true,
          order: 4
        }
      ]
    },
    formSettings: {
      requirementLabel: 'Requirement',
      requirementOptions: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      submitButtonText: 'Submit'
    }
  };

  await saveCareersConfig(defaultConfig);
  return defaultConfig;
};


