import { useState } from 'react';
import { Calculator, Smartphone } from 'lucide-react';
import { calculateAHP, calculateWeightsFromMatrix } from './utils/ahp';

// Define types
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

const phones: Phone[] = [
  { name: "iPhone 12", memory: 4, storage: 128, cpuFrequency: 3.0, price: 699, brandValue: 9 },
  { name: "ItelA56", memory: 2, storage: 32, cpuFrequency: 1.8, price: 100, brandValue: 3 },
  { name: "Tecno Camon 12", memory: 4, storage: 64, cpuFrequency: 2.0, price: 200, brandValue: 4 },
  { name: "Infinix Hot 10", memory: 4, storage: 64, cpuFrequency: 2.0, price: 180, brandValue: 4 },
  { name: "Huawei P30", memory: 6, storage: 128, cpuFrequency: 2.6, price: 599, brandValue: 7 },
  { name: "Google Pixel 7", memory: 8, storage: 128, cpuFrequency: 2.8, price: 599, brandValue: 8 },
  { name: "Xiaomi Redmi Note 10", memory: 6, storage: 128, cpuFrequency: 2.2, price: 299, brandValue: 6 },
  { name: "Samsung Galaxy S22", memory: 8, storage: 256, cpuFrequency: 3.0, price: 799, brandValue: 8 },
  { name: "Motorola Razr+", memory: 8, storage: 256, cpuFrequency: 3.2, price: 999, brandValue: 6 },
  { name: "iPhone XR", memory: 3, storage: 64, cpuFrequency: 2.5, price: 499, brandValue: 9 },
  { name: "Samsung Galaxy Note 10", memory: 8, storage: 256, cpuFrequency: 2.8, price: 949, brandValue: 8 }
];

const criteria = ['memory', 'storage', 'cpuFrequency', 'price', 'brandValue'];

function App() {
  const [results, setResults] = useState<{ phone: Phone; score: number }[]>([]);
  const [calculated, setCalculated] = useState(false);
  const [matrix, setMatrix] = useState<number[][]>(
    Array(criteria.length).fill(null).map((_, i) => 
      Array(criteria.length).fill(null).map((_, j) => i === j ? 1 : 0)
    )
  );

  const handleMatrixChange = (row: number, col: number, value: number) => {
    const newMatrix = [...matrix];
    newMatrix[row][col] = value;
    // Set reciprocal value
    if (row !== col) {
      newMatrix[col][row] = 1 / value;
    }
    setMatrix(newMatrix);
  };

  const handleCalculate = () => {
    const weights = calculateWeightsFromMatrix(matrix);
    const criteriaWeights: CriteriaWeights = {
      memory: weights[0],
      storage: weights[1],
      cpuFrequency: weights[2],
      price: weights[3],
      brandValue: weights[4]
    };
    const ahpResults = calculateAHP(phones, criteriaWeights);
    setResults(ahpResults);
    setCalculated(true);
  };

  const getPreferenceLabel = (value: number): string => {
    if (value === 1) return 'Equal';
    if (value === 3) return 'Moderate';
    if (value === 5) return 'Strong';
    if (value === 7) return 'Very Strong';
    if (value === 9) return 'Extreme';
    return value.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Smartphone className="h-10 w-10 text-indigo-600" />
            Phone Selection AHP Calculator
            <Calculator className="h-10 w-10 text-indigo-600" />
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Set your preferences using the comparison matrix below
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pairwise Comparison Matrix</h2>
          <p className="text-sm text-gray-600 mb-4">
            Compare criteria importance: 1 = Equal, 3 = Moderate, 5 = Strong, 7 = Very Strong, 9 = Extreme
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2"></th>
                  {criteria.map(criterion => (
                    <th key={criterion} className="px-4 py-2 font-medium text-gray-900 capitalize">
                      {criterion}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criteria.map((rowCriterion, row) => (
                  <tr key={rowCriterion}>
                    <td className="px-4 py-2 font-medium text-gray-900 capitalize">{rowCriterion}</td>
                    {criteria.map((colCriterion, col) => (
                      <td key={`${rowCriterion}-${colCriterion}`} className="px-4 py-2">
                        {row === col ? (
                          <span className="text-gray-500">1</span>
                        ) : row < col ? (
                          <select
                            value={matrix[row][col]}
                            onChange={(e) => handleMatrixChange(row, col, Number(e.target.value))}
                            className="w-full rounded border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          >
                            <option value="0">Select...</option>
                            {[1, 3, 5, 7, 9].map(value => (
                              <option key={value} value={value}>
                                {getPreferenceLabel(value)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-500">
                            {matrix[col][row] ? (1 / matrix[col][row]).toFixed(2) : '0.00'}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors mb-8"
        >
          Calculate Best Phone
        </button>

        {calculated && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Results</h2>
            <div className="space-y-4">
              {results.map(({ phone, score }, index) => (
                <div
                  key={phone.name}
                  className={`p-4 rounded-lg ${
                    index === 0 ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {index + 1}. {phone.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Memory: {phone.memory}GB | Storage: {phone.storage}GB | CPU: {phone.cpuFrequency}GHz | 
                        Price: ${phone.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-indigo-600">
                        {(score * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;