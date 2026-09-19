import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaRedo, FaMoon, FaSun, FaExpand, FaCompress } from 'react-icons/fa';

const CodeIDE = () => {
    const { code } = useParams();
    const [userCode, setUserCode] = useState(decodeURIComponent(code) || '');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState('python');
    const [errorMarkers, setErrorMarkers] = useState([]);
    const [darkMode, setDarkMode] = useState(true);
    const [fullScreen, setFullScreen] = useState(false);
    const [editorTheme, setEditorTheme] = useState('dracula');
    const [showOutput, setShowOutput] = useState(true);

    useEffect(() => {
        if (userCode.trim().startsWith('#include')) {
            setLanguage('cpp');
        } else if (userCode.trim().startsWith('import') || userCode.trim().startsWith('def') || userCode.trim().startsWith('print')) {
            setLanguage('python');
        }
    }, [userCode]);

    useEffect(() => {
        setEditorTheme(darkMode ? 'dracula' : 'github');
    }, [darkMode]);

    const handleCodeChange = (newValue) => {
        setUserCode(newValue);
        setErrorMarkers([]);
        if (newValue.trim().startsWith('#include')) {
            setLanguage('cpp');
        } else if (newValue.trim().startsWith('import') || newValue.trim().startsWith('def') || newValue.trim().startsWith('print')) {
            setLanguage('python');
        }
    };

    const handleRun = async () => {
        setLoading(true);
        setOutput('');
        setError(null);
        setErrorMarkers([]);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8081/execute-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ code: userCode, language: language }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData && errorData.stderr) {
                    setError(errorData.stderr);
                } else {
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
            } else {
                const data = await response.json();
                if (data.error) {
                    setError(data.error);
                    setOutput(data.output + '\n' + (data.stderr || ''));
                    if (data.line) {
                        setErrorMarkers([{
                            startRow: data.line - 1,
                            endRow: data.line,
                            message: data.error,
                            className: 'error-marker',
                            type: 'error'
                        }]);
                    }
                } else {
                    setOutput(data.output);
                    setShowOutput(true);
                }
            }
        } catch (err) {
            setError(err.message);
            console.error('Error running code:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetEditor = () => {
        setUserCode('');
        setOutput('');
        setError(null);
        setErrorMarkers([]);
    };

    const getLoader = () => (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    return (
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-100'} text-${darkMode ? 'white' : 'gray-900'} min-h-screen transition-colors duration-300`}>
            <style>{`
                .ace_error-marker {
                    background-color: rgba(255, 0, 0, 0.3);
                    position: absolute;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: ${darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'};
                }
                .editor-container {
                    ${fullScreen ? 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 100;' : ''}
                }
            `}</style>

            <div className={`container mx-auto px-4 py-8 ${fullScreen ? 'pt-20' : ''}`}>
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-wrap items-center justify-between gap-4 mb-8"
                >
                    <div className="flex items-center gap-4">
                        <h1 className={`text-3xl font-bold bg-clip-text ${darkMode ? 'text-transparent bg-gradient-to-r from-blue-400 to-purple-400' : 'text-gray-800'}`}>
                            Code Editor
                        </h1>
                        <div className={`px-3 py-1 rounded-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-200'} border ${darkMode ? 'text-blue-300' : 'text-blue-600'} font-mono text-sm`}>
                            {language === 'python' ? 'Python' : 'C++'}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFullScreen(!fullScreen)}
                            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-blue-300' : 'bg-gray-200 text-gray-700'}`}
                            aria-label="Toggle fullscreen"
                        >
                            {fullScreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetEditor}
                            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-red-300' : 'bg-gray-200 text-gray-700'}`}
                            aria-label="Reset editor"
                        >
                            <FaRedo size={18} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRun}
                            disabled={loading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-md transition-all ${darkMode ? 
                                'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' : 
                                'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'} 
                                ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    {getLoader()}
                                    Running...
                                </>
                            ) : (
                                <>
                                    <FaPlay size={14} />
                                    Run Code
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>

                <div className={`flex flex-col lg:flex-row gap-6 ${fullScreen ? 'h-[calc(100vh-120px)]' : ''}`}>
                    {/* Editor Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={`flex-1 ${fullScreen ? 'h-full' : 'h-[500px]'} ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                        <AceEditor
                            mode={language === 'cpp' ? 'c_cpp' : 'python'}
                            theme={editorTheme}
                            onChange={handleCodeChange}
                            value={userCode}
                            name="code-editor"
                            editorProps={{ $blockScrolling: true }}
                            width="100%"
                            height="100%"
                            fontSize={16}
                            showPrintMargin={false}
                            showGutter={true}
                            highlightActiveLine={true}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true,
                                showLineNumbers: true,
                                tabSize: 4,
                                fontFamily: "'Fira Code', monospace",
                                useWorker: true
                            }}
                            markers={errorMarkers}
                            className="rounded-t-xl"
                            style={{
                                backgroundColor: darkMode ? '#1f2937' : '#ffffff'
                            }}
                        />
                    </motion.div>

                    {/* Output Section */}
                    {showOutput && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={`flex-1 ${fullScreen ? 'h-full' : 'h-[500px]'} flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                            <div className={`flex justify-between items-center p-3 border-b ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                                <h2 className="font-semibold">
                                    <span className={`${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Output</span>
                                    {loading && (
                                        <span className="ml-2 text-sm text-gray-400">Executing...</span>
                                    )}
                                </h2>
                                <button 
                                    onClick={() => setShowOutput(false)}
                                    className={`p-1 rounded-full text-red-600 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                >
                                    X
                                </button>
                            </div>
                            <div className={`flex-1 overflow-auto p-4 custom-scrollbar ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={`mb-4 rounded-lg p-3 ${darkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-100 border-red-200'} border`}
                                        >
                                            <h3 className={`font-semibold mb-1 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>Error</h3>
                                            <pre className={`text-sm whitespace-pre-wrap font-mono ${darkMode ? 'text-red-200' : 'text-red-800'}`}>{error}</pre>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {output && (
                                        <motion.pre
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={`whitespace-pre-wrap font-mono text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                                        >
                                            {output}
                                        </motion.pre>
                                    )}
                                </AnimatePresence>

                                {!output && !error && !loading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`h-full flex items-center justify-center ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}
                                    >
                                        <div className="text-center">
                                            <div className="mb-2 text-4xl">👨‍💻</div>
                                            <p>Run your code to see the output here</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                {!showOutput && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowOutput(true)}
                        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg ${darkMode ? 
                            'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 
                            'bg-gradient-to-r from-blue-500 to-purple-500 text-white'}`}
                    >
                        <FaExpand size={18} />
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default CodeIDE;