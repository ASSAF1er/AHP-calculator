import { eigs } from 'mathjs';

interface Phone {
  name: string;
  memory: number;
  storage: number;
  cpuFrequency: number;
  price: number;
  brandValue: number;
}

interface CriteriaWeights {
  memory: number;
  storage: number;
  cpuFrequency: number;
  price: number;
  brandValue: number;
}

// Calculate weights from pairwise comparison matrix using eigenvector method
export function calculateWeightsFromMatrix(matrix: number[][]): number[] {
  // Ensure all zero values are set to 1 for the calculation
  const normalizedMatrix = matrix.map(row => 
    row.map(value => value === 0 ? 1 : value)
  );

  // Calculate eigenvalues and eigenvectors
  const { vectors } = eigs(normalizedMatrix);
  
  // Get the principal eigenvector (first column)
  const principalEigenvector = vectors.map(row => Math.abs(row[0]));
  
  // Normalize the eigenvector
  const sum = principalEigenvector.reduce((a, b) => a + b, 0);
  return principalEigenvector.map(value => value / sum);
}

// Normalize values for a specific criterion
function normalizeValues(phones: Phone[], criterion: keyof Phone): number[] {
  const values = phones.map(phone => phone[criterion] as number);
  const sum = values.reduce((a, b) => a + b, 0);
  return values.map(value => value / sum);
}

// For price, lower is better, so we invert the values
function normalizePrice(phones: Phone[]): number[] {
  const prices = phones.map(phone => phone.price);
  const maxPrice = Math.max(...prices);
  const invertedNormalized = prices.map(price => (maxPrice - price) / maxPrice);
  const sum = invertedNormalized.reduce((a, b) => a + b, 0);
  return invertedNormalized.map(value => value / sum);
}

export function calculateAHP(phones: Phone[], weights: CriteriaWeights): { phone: Phone; score: number }[] {
  // Calculate normalized scores for each criterion
  const memoryScores = normalizeValues(phones, 'memory');
  const storageScores = normalizeValues(phones, 'storage');
  const cpuScores = normalizeValues(phones, 'cpuFrequency');
  const priceScores = normalizePrice(phones);
  const brandScores = normalizeValues(phones, 'brandValue');

  // Calculate final scores
  const finalScores = phones.map((phone, index) => {
    const score = 
      memoryScores[index] * weights.memory +
      storageScores[index] * weights.storage +
      cpuScores[index] * weights.cpuFrequency +
      priceScores[index] * weights.price +
      brandScores[index] * weights.brandValue;

    return {
      phone,
      score
    };
  });

  // Sort by score in descending order
  return finalScores.sort((a, b) => b.score - a.score);
}