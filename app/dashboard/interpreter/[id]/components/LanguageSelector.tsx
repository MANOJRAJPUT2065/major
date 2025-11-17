import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const LANGUAGE_VERSIONS = {
    python: "3.10.0",
};

const languages = Object.entries(LANGUAGE_VERSIONS);

const LanguageSelector = ({ language, onSelect }: any) => {
    return (
        <div className="mb-2">
            <Select
                value={language}
                onValueChange={(selectedLanguage) => onSelect(selectedLanguage)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={language} />
                </SelectTrigger>
                <SelectContent>
                    {languages.map(([language, version]) => (
                        <SelectItem key={language} value={language}>
                            {language} <span className="text-sm text-gray-600">({version})</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default LanguageSelector;
