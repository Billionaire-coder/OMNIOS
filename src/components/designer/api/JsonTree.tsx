import React from 'react';
import { ChevronRight, ChevronDown, PlusCircle } from 'lucide-react';

interface JsonTreeProps {
    data: any;
    path?: string;
    onSelectPath: (path: string, type: string, value: any) => void;
    level?: number;
}

export const JsonTree: React.FC<JsonTreeProps> = ({ data, path = '', onSelectPath, level = 0 }) => {
    const [isExpanded, setIsExpanded] = React.useState(level < 2);

    if (data === null) return <span className="text-gray-500 italic">null</span>;
    if (data === undefined) return <span className="text-gray-500 italic">undefined</span>;

    const type = Array.isArray(data) ? 'array' : typeof data;

    if (type === 'object' || type === 'array') {
        const isArray = type === 'array';
        const keys = Object.keys(data);
        const isEmpty = keys.length === 0;

        return (
            <div className="font-mono text-[11px] leading-5">
                <div
                    className="flex items-center gap-1 hover:bg-white/5 rounded cursor-pointer select-none"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isEmpty ? (
                        <span className="w-3" />
                    ) : (
                        isExpanded ? <ChevronDown size={10} className="text-gray-500" /> : <ChevronRight size={10} className="text-gray-500" />
                    )}
                    <span className="text-purple-400">{isArray ? '[' : '{'}</span>
                    {!isExpanded && <span className="text-gray-600">...</span>}
                    {isExpanded ? null : <span className="text-purple-400">{isArray ? ']' : '}'}</span>}

                    {!isExpanded && keys.length > 0 && (
                        <span className="text-gray-600 ml-2">// {keys.length} items</span>
                    )}

                    {/* Allow mapping the whole object/array if needed */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectPath(path, type, data);
                        }}
                        className="ml-auto opacity-0 group-hover:opacity-100 hover:text-teal-400 text-gray-600 transition-opacity"
                        title="Map this object"
                    >
                        <PlusCircle size={10} />
                    </button>
                </div>

                {isExpanded && !isEmpty && (
                    <div className="pl-3 border-l border-white/5 ml-1">
                        {keys.map((key, index) => {
                            const currentPath = path ? (isArray ? `${path}[${key}]` : `${path}.${key}`) : key;
                            return (
                                <div key={key} className="flex items-start group">
                                    {!isArray && (
                                        <span className="text-blue-300 mr-1 opacity-80">{key}:</span>
                                    )}
                                    <JsonTree
                                        data={data[key]}
                                        path={currentPath}
                                        onSelectPath={onSelectPath}
                                        level={level + 1}
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Determine type of child
                                            const val = data[key];
                                            const t = Array.isArray(val) ? 'array' : typeof val;
                                            onSelectPath(currentPath, t, val);
                                        }}
                                        className="ml-2 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-teal-400 transition-opacity"
                                        title="Map this field"
                                    >
                                        <PlusCircle size={10} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
                {isExpanded && (
                    <div className="text-purple-400">{isArray ? ']' : '}'}</div>
                )}
            </div>
        );
    }

    // Primitive values
    let valueColor = 'text-gray-300';
    if (type === 'string') valueColor = 'text-orange-300';
    if (type === 'number') valueColor = 'text-yellow-300';
    if (type === 'boolean') valueColor = 'text-pink-300';

    return (
        <span className={`font-mono text-[11px] ${valueColor}`}>
            {type === 'string' ? `"${data}"` : String(data)}
        </span>
    );
};
