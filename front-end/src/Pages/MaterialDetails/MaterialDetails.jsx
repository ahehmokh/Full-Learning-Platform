import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaCommentDots,
  FaPaperPlane,
  FaTimes,
  FaFilePdf,
  FaYoutube,
  FaCode,
  FaClock,
  FaUser,
  FaBook,
  FaChevronDown,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MaterialDetails = () => {
  const { materialId } = useParams();
  const [material, setMaterial] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  const [isAITyping, setIsAITyping] = useState(false);
  const [openAIError, setOpenAIError] = useState(null);
  const [expandedTopicId, setExpandedTopicId] = useState(null);

  useEffect(() => {
    const fetchMaterialDetails = async () => {
      try {
        const materialResponse = await fetch(
          `http://localhost:8081/materials/${materialId}`
        );
        if (!materialResponse.ok) {
          throw new Error(`HTTP error! status: ${materialResponse.status}`);
        }
        const materialData = await materialResponse.json();
        setMaterial(materialData);

        const topicsResponse = await fetch(
          `http://localhost:8081/materials/${materialId}/topics`
        );
        if (!topicsResponse.ok) {
          throw new Error(`HTTP error! status: ${topicsResponse.status}`);
        }
        const topicsData = await topicsResponse.json();
        setTopics(topicsData.map((topic) => ({ ...topic, isSelected: false })));
      } catch (err) {
        setError(err.message);
        console.error("Error fetching material details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialDetails();
  }, [materialId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

const formatTextWithHeadingsAndAddresses = (text) => {
    if (!text) return text;
    
    // Regular expressions for different patterns
    const mainHeadingRegex = /^(\d+[-.]\s*.+)/gm;
    const subHeadingRegex = /^(.+:\s*$)/gm;
    const addressRegex = /(\d+\s+[\w\s]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Circle|Cir|Way|Terrace|Ter|Place|Pl)\b|\b(?:P\.?O\.?\s*Box\s+\d+)\b|\b\d+\s+[\w\s]+,\s*[\w\s]+,\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?\b)/gi;
    // Match equations (text between $ symbols or common math patterns)
    const equationRegex = /(\$[^$]+\$)|([a-zA-Z]+\s*=\s*[^$\n]+)|([a-zA-Z]+\s*\([^)]+\)\s*=\s*[^$\n]+)/g;
    
    return text.split('\n').map((paragraph, pIndex) => {
        if (!paragraph.trim()) return null;
        
        // Check if this is a main heading
        if (mainHeadingRegex.test(paragraph)) {
            return (
                <h3 
                    key={pIndex} 
                    className="text-xl font-bold text-gray-800 mb-2 mt-4"
                    style={{ fontSize: '1.25rem', lineHeight: '1.75rem' }}
                >
                    {paragraph}
                </h3>
            );
        }
        
        // Check if this is a subheading (ends with colon)
        if (subHeadingRegex.test(paragraph)) {
            return (
                <h4 
                    key={pIndex} 
                    className="text-lg font-bold text-gray-700 mb-2 mt-3"
                    style={{ fontSize: '1.125rem', lineHeight: '1.5rem' }}
                >
                    {paragraph}
                </h4>
            );
        }
        
        // Process both addresses and equations in regular paragraphs
        const parts = [];
        let lastIndex = 0;
        
        // First find all matches (both addresses and equations)
        const allMatches = [];
        let match;
        
        // Find address matches
        while ((match = addressRegex.exec(paragraph)) !== null) {
            allMatches.push({
                type: 'address',
                index: match.index,
                text: match[0],
                length: match[0].length
            });
        }
        
        // Find equation matches
        while ((match = equationRegex.exec(paragraph)) !== null) {
            // Use the first non-empty group
            const matchedText = match.find(m => m);
            allMatches.push({
                type: 'equation',
                index: match.index,
                text: matchedText,
                length: matchedText.length
            });
        }
        
        // Sort matches by their position in the text
        allMatches.sort((a, b) => a.index - b.index);
        
        // Reconstruct the paragraph with styled parts
        let currentPos = 0;
        const styledParts = [];
        
        for (const match of allMatches) {
            // Add text before the match
            if (match.index > currentPos) {
                styledParts.push(paragraph.substring(currentPos, match.index));
            }
            
            // Add the styled match
            if (match.type === 'address') {
                styledParts.push(
                    <span 
                        key={`${pIndex}-${match.index}`}
                        className="font-bold text-lg text-blue-700 bg-blue-50 px-1 py-0.5 rounded"
                        style={{ fontSize: '1.125rem', lineHeight: '1.75rem' }}
                    >
                        {match.text}
                    </span>
                );
            } else { // equation
                styledParts.push(
                    <span 
                        key={`${pIndex}-${match.index}`}
                        className="font-mono font-semibold text-purple-700 bg-purple-50 px-1 py-0.5 rounded"
                        style={{ fontSize: '1.1rem', lineHeight: '1.75rem' }}
                    >
                        {match.text}
                    </span>
                );
            }
            
            currentPos = match.index + match.length;
        }
        
        // Add remaining text after last match
        if (currentPos < paragraph.length) {
            styledParts.push(paragraph.substring(currentPos));
        }
        
        return (
            <p key={pIndex} className="mb-4">
                {styledParts.length > 0 ? styledParts : paragraph}
            </p>
        );
    });
};

  const handleTestCode = (code) => navigate(`/ide/${encodeURIComponent(code)}`);
  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const handleChatInputChange = (e) => {
    setChatInput(e.target.value);
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    let videoId;
    try {
      const urlObj = new URL(url);
      if (
        urlObj.hostname === "www.youtube.com" ||
        urlObj.hostname === "youtube.com"
      ) {
        videoId = urlObj.searchParams.get("v");
      } else if (urlObj.hostname === "youtu.be") {
        videoId = urlObj.pathname.substring(1);
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (e) {
      console.error("Error parsing YouTube URL", e);
      return null;
    }
    return null;
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = { text: chatInput, sender: "user" };
    setChatMessages((prevMessages) => [...prevMessages, userMessage]);
    setChatInput("");
    setIsAITyping(true);

    setTimeout(() => {
      let aiResponseText = "";
      const lowerCaseInput = chatInput.toLowerCase();

      if (lowerCaseInput.includes("author")) {
        aiResponseText = material?.author
          ? `The author of this material is ${material.author}.`
          : "I'm sorry, I don't have information about the author for this material.";
      } else if (
        lowerCaseInput.includes("pdf") ||
        lowerCaseInput.includes("download")
      ) {
        aiResponseText = material?.material_link
          ? `You can download the PDF version of this material here: http://localhost:8081/${material.material_link}. Would you like me to help you with anything else?`
          : "Unfortunately, a PDF version is not available for this material.";
      } else if (
        lowerCaseInput.includes("code") ||
        lowerCaseInput.includes("example")
      ) {
        aiResponseText = material?.written_code
          ? "Yes, this material includes code examples. You can easily test the code by clicking the 'Test Code' button. Is there anything specific you want to know about the code?"
          : "I'm afraid this material doesn't contain any code examples.";
      } else if (
        lowerCaseInput.includes("video") ||
        lowerCaseInput.includes("tutorial")
      ) {
        aiResponseText = material?.video_link
          ? `Yes, there is a video tutorial available here: ${material.video_link}. Let me know if you have any other questions.`
          : "I'm sorry, I couldn't find a video tutorial for this material.";
      } else if (
        lowerCaseInput.includes("topics") ||
        lowerCaseInput.includes("content")
      ) {
        aiResponseText =
          topics.length > 0
            ? "This material covers several topics. You can click on the topic name to view its content. Do you want me to summarize a specific topic?"
            : "There are no specific topics listed for this material.";
      } else if (lowerCaseInput.includes("help")) {
        aiResponseText =
          "I can provide information about the author, PDF download, included code, video tutorials, and topics covered in this material. Just ask me anything!";
      } else {
        aiResponseText =
          "I can help with information about this material. For example, you can ask me about the author, or if there is a PDF version. How can I assist you today?";
      }

      const aiResponse = { text: aiResponseText, sender: "bot" };
      setChatMessages((prevMessages) => [...prevMessages, aiResponse]);
      setIsAITyping(false);
    }, 1500 + Math.random() * 1000); // Simulate typing delay, between 1.5s and 2.5s
  };

  const handleTopicClick = (topicId) => {
    setExpandedTopicId((prevId) => (prevId === topicId ? null : topicId));
  };

  const getLanguageFromCode = (code) => {
    if (!code) return "Markup";
    const keywords = [
      {
        language: "JavaScript",
        keywords: ["function", "const", "let", "var", "=>"],
      },
      { language: "Python", keywords: ["def", "class", "import", "from"] },
      { language: "Java", keywords: ["public", "class", "static", "void"] },
      { language: "C++", keywords: ["#include", "int", "cout", "cin"] },
      { language: "C#", keywords: ["using", "namespace", "class", "static"] },
      { language: "HTML", keywords: ["<!DOCTYPE", "<html", "<head", "<body"] },
      { language: "CSS", keywords: ["body", "{", "}", "color", "font-size"] },
      {
        language: "SQL",
        keywords: ["SELECT", "FROM", "WHERE", "INSERT", "UPDATE"],
      },
      { language: "PHP", keywords: ["<?php", "function", "$_", "echo"] },
      { language: "Ruby", keywords: ["def", "class", "end", "puts"] },
      {
        language: "TypeScript",
        keywords: ["function", "const", "let", "class", "interface"],
      },
      { language: "Swift", keywords: ["func", "class", "let", "var"] },
      { language: "Kotlin", keywords: ["fun", "class", "val", "var"] },
      { language: "Go", keywords: ["package", "func", "import", "var"] },
      { language: "Rust", keywords: ["fn", "struct", "let", "mut"] },
    ];

    for (const { language, keywords: langKeywords } of keywords) {
      if (langKeywords.some((keyword) => code.includes(keyword))) {
        return language;
      }
    }
    return "Markup";
  };

  const SyntaxHighlighter = ({ children, language }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg overflow-hidden shadow-md"
      >
        <div className="text-sm font-mono text-gray-200 bg-gray-800 px-3 py-2 border-b border-gray-700">
          {language}
        </div>
        <pre
          className="language-markup bg-gray-900 text-gray-100 p-4 overflow-x-auto"
          style={{
            whiteSpace: "pre-wrap",
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        >
          <code>{children}</code>
        </pre>
      </motion.div>
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent"
        />
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center"
        >
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  if (!material)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center"
        >
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Material Not Found
          </h2>
          <p className="text-gray-600">
            The requested material could not be found.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen relative">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text"
        >
          Material Details
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-shadow duration-300"
        >
          {material && (
            <div className="space-y-6">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-semibold text-gray-900"
              >
                {material.material_name}
              </motion.h2>

              {material.material_description && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-gray-700 whitespace-pre-line">
                    <strong className="text-gray-800">Description: </strong>
                    <span style={{ wordBreak: "break-word" }}>
                      {material.material_description}
                    </span>
                  </p>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {material.material_link && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FaFilePdf className="h-5 w-5 text-red-500" />
                    <a
                      href={`http://localhost:8081/${material.material_link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Download PDF
                    </a>
                  </motion.div>
                )}

                {material.upload_date && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FaClock className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-600">
                      <strong>Upload Date:</strong>{" "}
                      {new Date(material.upload_date).toLocaleDateString()}
                    </p>
                  </motion.div>
                )}

                {material.author && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FaUser className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-600">
                      <strong>Author:</strong> {material.author}
                    </p>
                  </motion.div>
                )}

                {material.file_type && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FaBook className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-600">
                      <strong>File Type:</strong> {material.file_type}
                    </p>
                  </motion.div>
                )}
              </div>

              {material.written_code && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <FaCode className="h-5 w-5 text-purple-400" />
                    <span className="text-gray-800 font-semibold">Code:</span>
                  </div>
                  <SyntaxHighlighter
                    language={getLanguageFromCode(material.written_code)}
                  >
                    {material.written_code}
                  </SyntaxHighlighter>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTestCode(material.written_code)}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md"
                  >
                    <FaCode className="mr-2 h-4 w-4" />
                    Test Code
                  </motion.button>
                </motion.div>
              )}

              {material.video_link && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <FaYoutube className="h-5 w-5 text-red-600" />
                    <span className="text-gray-800 font-semibold">Video: </span>
                  </div>
                  <div className="relative w-full max-w-3xl mx-auto aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                    {getYouTubeEmbedUrl(material.video_link) ? (
                      <iframe
                        className="rounded-xl w-full h-full"
                        src={getYouTubeEmbedUrl(material.video_link)}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <p className="text-red-400 text-center bg-gray-100 p-4 rounded-xl">
                        Invalid YouTube link.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {topics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-shadow duration-300"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Topics
            </h2>
            <div className="space-y-4">
              {topics.map((topic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="mb-6"
                >
                  <motion.div
                    whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="flex justify-between items-center p-4 rounded-lg cursor-pointer transition-all duration-300 border border-gray-200"
                    style={{
                      backgroundColor:
                        expandedTopicId === topic.id
                          ? "#f3f4f6"
                          : "transparent",
                    }}
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-gray-700">
                        {index + 1}.
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {topic.topic_name}
                      </span>
                    </div>
                    <motion.div
                      animate={{
                        rotate: expandedTopicId === topic.id ? 180 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaChevronDown className="h-5 w-5 text-gray-500" />
                    </motion.div>
                  </motion.div>
                  <AnimatePresence>
                    {expandedTopicId === topic.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="mt-4 space-y-4"
                      >
                        {topic.topic_content && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-700 text-justify"
                          >
                            {formatTextWithHeadingsAndAddresses(
                              topic.topic_content
                            )}
                          </motion.div>
                        )}
                        {topic.written_code && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-2"
                          >
                            <span className="text-gray-800 font-semibold">
                              Code:
                            </span>
                            <SyntaxHighlighter
                              language={getLanguageFromCode(topic.written_code)}
                            >
                              {topic.written_code}
                            </SyntaxHighlighter>
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleTestCode(topic.written_code)}
                              className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md"
                            >
                              <FaCode className="mr-2 h-4 w-4" />
                              Test Code
                            </motion.button>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Chat Icon */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.1, backgroundColor: "#34d399" }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white p-4 rounded-full shadow-xl transition-all duration-300"
            onClick={toggleChat}
            style={{
              boxShadow: "0 4px 20px rgba(52, 211, 153, 0.5)",
            }}
          >
            <FaCommentDots size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-6 right-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-2xl w-full max-w-md max-h-[500px] flex flex-col border border-blue-100 z-50 overflow-hidden"
            style={{
              boxShadow: "0 10px 30px rgba(99, 102, 241, 0.3)",
            }}
          >
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-blue-500">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="p-1 bg-white/20 rounded-full"
                >
                  <FaCommentDots className="text-white" size={18} />
                </motion.div>
                <h2 className="text-lg font-semibold text-white">
                  Material Assistant
                </h2>
              </div>
              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleChat}
                className="text-gray-600/80 hover:text-black transition-all"
              >
                <FaTimes size={20} />
              </motion.button>
            </div>
            <div
              ref={chatContainerRef}
              className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-purple-50 to-blue-50"
            >
              {chatMessages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center p-8"
                >
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white max-w-xs">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <FaCommentDots
                        className="mx-auto text-purple-400 mb-3"
                        size={32}
                      />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-purple-600 mb-1">
                      How can I help?
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ask me about this material's content, code examples, or
                      download options.
                    </p>
                  </div>
                </motion.div>
              ) : (
                chatMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 relative ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                          : "bg-white text-gray-800 shadow-md border border-gray-100"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span
                        className={`absolute text-[10px] bottom-1 ${
                          message.sender === "user"
                            ? "right-2 text-white/70"
                            : "left-2 text-gray-500"
                        }`}
                      >
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {/* Message triangle */}
                      <div
                        className={`absolute w-3 h-3 -bottom-1 ${
                          message.sender === "user"
                            ? "right-0 bg-indigo-600 transform -translate-x-1/2 rotate-45"
                            : "left-0 bg-white transform translate-x-1/2 rotate-45 border-b border-l border-gray-200"
                        }`}
                      />
                    </div>
                  </motion.div>
                ))
              )}
              {isAITyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white text-gray-800 rounded-2xl px-4 py-3 max-w-[80%] shadow-md border border-gray-100">
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          delay: 0.2,
                        }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          delay: 0.4,
                        }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              {openAIError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm p-2 bg-red-50 rounded-lg"
                >
                  {openAIError}
                </motion.div>
              )}
            </div>
            <div className="p-4 bg-white border-t border-blue-100">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-blue-200"
              >
                <input
                  type="text"
                  placeholder="Ask about this material..."
                  value={chatInput}
                  onChange={handleChatInputChange}
                  className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  whileHover={{ scale: chatInput.trim() ? 1.1 : 1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    chatInput.trim()
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                      : "text-gray-400"
                  }`}
                >
                  <FaPaperPlane size={18} />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaterialDetails;
