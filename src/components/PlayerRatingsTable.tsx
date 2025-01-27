import React from 'react';
import { PlayerRatings } from '@/types/player';

interface PlayerRatingsTableProps {
    playerRatings: PlayerRatings;
}

const PlayerRatingsTable: React.FC<PlayerRatingsTableProps> = ({ playerRatings }) => {
    const {
        endurance,
        strength,
        injuryResistance,
        consistency,
        acceleration,
        explosiveness,
        topSpeed,
        athleticism,
        pacing,
        stamina,
        mentalToughness,
        overall,
        potential,
        typeRatings,
        speedStamina,
    } = playerRatings;

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Overall: {overall}</h2>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Potential: {potential}</h2>
            </div>
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700">
                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300">Overall Ratings</th>
                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300">Main Attributes</th>
                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300">Short Distance Attributes</th>
                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300">Middle Distance Attributes</th>
                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300">Long Distance Attributes</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="hover:bg-gray-100 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-bold">Short Distance: {typeRatings.shortDistanceOvr}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Athleticism: {athleticism}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Acceleration: {acceleration}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Speed Stamina: {speedStamina}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Pacing: {pacing}</td>
                    </tr>
                    <tr className="hover:bg-gray-100 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-bold">Middle Distance: {typeRatings.middleDistanceOvr}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Strength: {strength}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Explosiveness: {explosiveness}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100"></td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Stamina: {stamina}</td>
                    </tr>
                    <tr className="hover:bg-gray-100 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-bold">Long Distance: {typeRatings.longDistanceOvr}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Injury Resistance: {injuryResistance}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Top Speed: {topSpeed}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100"></td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Mental Toughness: {mentalToughness}</td>
                    </tr>
                    <tr className="hover:bg-gray-100 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100"></td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Consistency: {consistency}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100"></td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100"></td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100"></td>
                    </tr>
                    <tr className="hover:bg-gray-100 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100"></td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Endurance: {endurance}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100"></td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100"></td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default PlayerRatingsTable;
