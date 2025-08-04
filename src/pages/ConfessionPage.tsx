import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3 } from 'lucide-react';

const ConfessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState<string[]>(['职场']);
  const [content, setContent] = useState('');

  const tags = ['职场', '家庭', '情感', '生活感悟', '兴趣爱好'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    // Save confession to local storage
    const confessions = JSON.parse(localStorage.getItem('sheart_confessions') || '[]');
    const newConfession = {
      id: Date.now().toString(),
      content: content.trim(),
      tags: selectedTags,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: []
    };
    
    confessions.unshift(newConfession);
    localStorage.setItem('sheart_confessions', JSON.stringify(confessions));
    
    navigate('/confession-list');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-black hover:opacity-70 transition-opacity mr-4"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-black">发布吐槽</h1>
      </div>

      <div className="px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit3 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">
            丢出今天的不顺利吧！
          </h2>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-black mb-4">选择标签</h3>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Content Input */}
        <div className="mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的不顺利..."
            className="w-full h-40 px-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
            maxLength={500}
          />
          <div className="text-right text-sm text-gray-500 mt-2">
            {content.length}/500
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="w-full bg-black text-white py-4 px-8 rounded-xl text-lg font-medium hover:bg-gray-800 transition-all duration-200 active:scale-95 disabled:bg-gray-400 mb-4"
        >
          发布吐槽
        </button>

        {/* Browse Button */}
        <button
          onClick={() => navigate('/confession-list')}
          className="w-full text-black py-4 px-8 rounded-xl text-lg font-medium hover:bg-gray-100 transition-all duration-200 active:scale-95"
        >
          先不吐槽，看看大家都有什么烦恼
        </button>

        {/* Bottom Quote */}
        <div className="text-center mt-8">
          <p className="text-gray-600 leading-relaxed">
            我们重视你的每一步成长，也心疼你的每一个迷茫
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfessionPage;