import { Engineer, AvailabilityStatus, SkillType } from '../types';

/**
 * Mock data for engineers with realistic profiles and skill mappings
 */
export const mockEngineers: Engineer[] = [
  {
    id: 'eng-001',
    name: 'Arindam Samanta',
    skills: ['Backend', 'Database', 'Cloud'],
    availability: 'Available',
    currentWorkload: 30,
    expertise: {
      'Backend': 90,
      'Database': 85,
      'Cloud': 75,
      'Integration': 60,
      'DevOps': 50,
      'Security': 45
    },
    avatar: '/friends/Arindam Samanta.jpg',
    email: 'arindam.samanta@sap.com',
    department: 'Enterprise Solutions',
    isLeadEngineer: true
  },
  {
    id: 'eng-002',
    name: 'A M Kamaneeya',
    skills: ['Frontend', 'Mobile', 'UX'],
    availability: 'Available',
    currentWorkload: 20,
    expertise: {
      'Frontend': 95,
      'Mobile': 80,
      'UX': 85,
      'Backend': 40,
      'Integration': 55,
      'Analytics': 50
    },
    avatar: '/friends/A M Kamaneeya.jpg',
    email: 'kamaneeya.am@sap.com',
    department: 'User Experience'
  },
  {
    id: 'eng-003',
    name: 'Ishrath Fathima',
    skills: ['Database', 'Analytics', 'Backend'],
    availability: 'Available',
    currentWorkload: 20,
    expertise: {
      'Database': 95,
      'Analytics': 90,
      'Backend': 70,
      'Cloud': 65,
      'Integration': 60,
      'Security': 50
    },
    avatar: '/friends/Ishrath Fathima.jpg',
    email: 'ishrath.fathima@sap.com',
    department: 'Data Solutions'
  },
  {
    id: 'eng-004',
    name: 'Muqadasah',
    skills: ['Security', 'Network', 'Cloud'],
    availability: 'Available',
    currentWorkload: 40,
    expertise: {
      'Security': 95,
      'Network': 85,
      'Cloud': 80,
      'DevOps': 70,
      'Backend': 60,
      'Integration': 55
    },
    avatar: '/friends/Muqadasah.jpg',
    email: 'muqadasah@sap.com',
    department: 'Security & Infrastructure',
    isLeadEngineer: true
  },
  {
    id: 'eng-005',
    name: 'S Dhamini',
    skills: ['DevOps', 'Cloud', 'Integration'],
    availability: 'Available',
    currentWorkload: 30,
    expertise: {
      'DevOps': 90,
      'Cloud': 95,
      'Integration': 85,
      'Network': 75,
      'Backend': 65,
      'Security': 60
    },
    avatar: '/friends/S Dhamini.jpg',
    email: 's.dhamini@sap.com',
    department: 'Cloud Operations'
  },
  {
    id: 'eng-006',
    name: 'Sayandeep Sinha',
    skills: ['Integration', 'Backend', 'Analytics'],
    availability: 'Available',
    currentWorkload: 30,
    expertise: {
      'Integration': 95,
      'Backend': 80,
      'Analytics': 75,
      'Database': 70,
      'Cloud': 65,
      'DevOps': 55
    },
    avatar: '/friends/Sayandeep Sinha.jpg',
    email: 'sayandeep.sinha@sap.com',
    department: 'Enterprise Solutions'
  }
];

/**
 * Get engineers by skill type
 * @param skill The skill to filter by
 * @returns Array of engineers with the specified skill
 */
export const getEngineersBySkill = (skill: SkillType): Engineer[] => {
  return mockEngineers.filter(engineer => engineer.skills.includes(skill));
};

/**
 * Get available engineers
 * @returns Array of engineers with 'Available' status
 */
export const getAvailableEngineers = (): Engineer[] => {
  return mockEngineers.filter(engineer => engineer.availability === 'Available');
};

/**
 * Get lead engineers
 * @returns Array of engineers with isLeadEngineer flag set to true
 */
export const getLeadEngineers = (): Engineer[] => {
  return mockEngineers.filter(engineer => engineer.isLeadEngineer === true);
};

/**
 * Find the best engineer for a specific skill based on expertise and availability
 * @param skill The required skill
 * @returns The best available engineer or null if none found
 */
export const findBestEngineerForSkill = (skill: SkillType): Engineer | null => {
  const availableEngineers = mockEngineers.filter(
    engineer => engineer.availability === 'Available' && engineer.skills.includes(skill)
  );

  if (availableEngineers.length === 0) return null;

  return availableEngineers.reduce((best, current) => {
    const bestExpertise = best.expertise[skill] || 0;
    const currentExpertise = current.expertise[skill] || 0;
    return currentExpertise > bestExpertise ? current : best;
  }, availableEngineers[0]);
};

/**
 * Update engineer availability
 * @param engineerId The engineer ID
 * @param availability The new availability status
 * @returns The updated engineer or undefined if not found
 */
export const updateEngineerAvailability = (
  engineerId: string,
  availability: AvailabilityStatus
): Engineer | undefined => {
  const engineerIndex = mockEngineers.findIndex(eng => eng.id === engineerId);
  if (engineerIndex === -1) return undefined;

  mockEngineers[engineerIndex] = {
    ...mockEngineers[engineerIndex],
    availability
  };

  return mockEngineers[engineerIndex];
};

/**
 * Get engineer by ID
 * @param id The engineer ID
 * @returns The engineer with the specified ID or undefined if not found
 */
export const getEngineerById = (id: string): Engineer | undefined => {
  return mockEngineers.find(engineer => engineer.id === id);
};