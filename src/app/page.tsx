'use client';

import { useState, useEffect } from 'react';
import AceEditor from 'react-ace';

// Import Ace Editor modes
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-rust';
import 'ace-builds/src-noconflict/mode-golang';

import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';


const DEFAULT_PROMPTS = [
  'Review this code for potential bugs and suggest fixes.',
  'Refactor this code for better readability and performance.',
  'Add comments and documentation to this code.',
  'Optimize this code for security vulnerabilities.',
];

export default function Home() {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [code, setCode] = useState('');
  const [reviewedCode, setReviewedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript'); // Initial default
  const [editingPromptIndex, setEditingPromptIndex] = useState<number | null>(null);

  const languageOptions = [
    { name: 'Java', aceMode: 'java', syntaxHighlighterLang: 'java' },
    { name: 'C/C++', aceMode: 'c_cpp', syntaxHighlighterLang: 'cpp' },
    { name: 'Python', aceMode: 'python', syntaxHighlighterLang: 'python' },
    { name: 'HTML', aceMode: 'html', syntaxHighlighterLang: 'html' },
    { name: 'Javascript', aceMode: 'javascript', syntaxHighlighterLang: 'javascript' },
    { name: 'Rust', aceMode: 'rust', syntaxHighlighterLang: 'rust' },
    { name: 'Golang', aceMode: 'golang', syntaxHighlighterLang: 'go' },
  ];

  // Load prompts and selected language from local storage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPrompts = localStorage.getItem('codeReviewPrompts');
      if (storedPrompts) {
        const parsedPrompts = JSON.parse(storedPrompts);
        setPrompts(parsedPrompts);
        setSelectedPrompt(parsedPrompts[0] || '');
      } else {
        setPrompts(DEFAULT_PROMPTS);
        setSelectedPrompt(DEFAULT_PROMPTS[0]);
      }

      const storedLanguage = localStorage.getItem('codeReviewLanguage');
      if (storedLanguage) {
        setSelectedLanguage(storedLanguage);
      }
    }
  }, []);

  // Save prompts to local storage whenever prompts state changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (typeof window !== 'undefined' && prompts.length > 0) {
        localStorage.setItem('codeReviewPrompts', JSON.stringify(prompts));
      }
    }, 500); // Debounce with 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [prompts]);

  // Save selected language to local storage whenever selectedLanguage state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('codeReviewLanguage', selectedLanguage);
    }
  }, [selectedLanguage]);


  const handleDeletePrompt = (index: number) => {
    const updatedPrompts = [...prompts];
    updatedPrompts.splice(index, 1);
    setPrompts(updatedPrompts);
  };

  const handleEditPrompt = (index: number) => {
    setEditingPromptIndex(index);
    setCustomPrompt(prompts[index]);
  };

  const handleAddOrUpdatePrompt = () => {
    if (editingPromptIndex !== null) {
      // Update existing prompt
      const updatedPrompts = [...prompts];
      updatedPrompts[editingPromptIndex] = customPrompt;
      setPrompts(updatedPrompts);
      setEditingPromptIndex(null);
      setCustomPrompt('');
    } else {
      // Add new prompt
      if (customPrompt && !prompts.includes(customPrompt)) {
        const updatedPrompts = [...prompts, customPrompt];
        setPrompts(updatedPrompts);
        setSelectedPrompt(customPrompt);
        setCustomPrompt('');
      }
    }
  };

  const handleReview = async () => {
    setIsLoading(true);
    setError(null);
    setReviewedCode('');

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, prompt: selectedPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to review code: ${errorData.error || response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Streaming response not available.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        setReviewedCode((prev) => prev + chunk);
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reviewedCode);
  };

  return (
    <div className="flex w-screen h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 p-4">
        <h1 className="text-2xl font-bold mb-4">Code Review</h1>
        <h2 className="text-lg font-semibold mb-4">Prompts</h2>
        <ul>
          {prompts.map((prompt, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-2 rounded hover:bg-gray-700"
            >
              <span
                className={`cursor-pointer ${selectedPrompt === prompt ? 'text-blue-400' : ''}`}
                onClick={() => setSelectedPrompt(prompt)}
              >
                {prompt}
              </span>
              <div className="flex flex-col gap-1">
                <button
                  className="text-xs bg-yellow-600 hover:bg-yellow-500 px-1 py-1 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditPrompt(index);
                  }}
                >
                  ✏️
                </button>
                <button
                  className="text-xs bg-red-600 hover:bg-red-500 px-1 py-1 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePrompt(index);
                  }}
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <textarea
            className="w-full h-24 p-2 bg-gray-700 rounded"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter custom prompt"
          />
          <button
            className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            onClick={handleAddOrUpdatePrompt}
          >
            {editingPromptIndex !== null ? 'Update Prompt' : 'Add Prompt'}
          </button>
          {editingPromptIndex !== null && (
            <button
              className="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                setEditingPromptIndex(null);
                setCustomPrompt('');
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
        <div className="mt-4">
          <label htmlFor="language-select" className="mr-2">Language:</label>
          <select
            id="language-select"
            className="bg-gray-700 p-2 rounded"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            {languageOptions.map((option) => (
              <option key={option.aceMode} value={option.aceMode}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <button
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          onClick={handleReview}
          disabled={isLoading}
        >
          {isLoading ? 'Reviewing...' : 'Review Code'}
        </button>
      </aside>
      <main className="flex-1 flex flex-col p-4 w-full h-full">
        <div className="flex-1 flex gap-4 w-full h-full">
          <div className="w-1/2 flex flex-col h-full">
            <h2 className="text-lg font-semibold mb-2">Your Code</h2>
            <div className="flex-1 overflow-scroll-hidden">
              <AceEditor
                mode={selectedLanguage}
                theme="monokai"
                name="code_editor"
                onChange={setCode}
                value={code}
                editorProps={{ $blockScrolling: true }}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: true,
                  showLineNumbers: true,
                  tabSize: 2,
                }}
                width="100%"
                height="100%"
              />
            </div>
          </div>
          <div className="w-1/2 flex flex-col h-full">
            <h2 className="text-lg font-semibold mb-2">Reviewed Code</h2>
            <div className="flex-1 relative h-full w-full overflow-scroll bg-gray-800 rounded border border-gray-700">
              <button
                className="absolute top-0 right-0 mt-2 mr-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded text-xs z-10"
                onClick={handleCopy}
              >
                Copy
              </button>
              {error ? (
                <p className="p-4 text-red-500">{error}</p>
              ) : (
                <SyntaxHighlighter
                  language='markdown'
                  style={vscDarkPlus}
                  customStyle={{
                    backgroundColor: "transparent",
                    margin: "0 !important",
                    padding: "0 !important",
                    overflow: "unset"
                  }}>
                  {reviewedCode}
                </SyntaxHighlighter>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}