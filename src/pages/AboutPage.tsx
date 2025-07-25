import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-12">
          <Link 
            to="/cover" 
            className="flex items-center text-black hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            返回
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-6">关于 Sheart</h1>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Sheart 是一个专为女性打造的友好社区平台，我们致力于为女性提供一个安全、温暖、支持的交流空间。
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-black mb-4">我们的使命</h2>
              <p className="text-gray-700 leading-relaxed">
                为女性创造一个可以自由表达、互相支持、共同成长的社区环境。我们相信每一个女性的声音都值得被倾听，每一个困惑都值得被理解。
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-black mb-4">核心价值</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• 尊重与包容</li>
                <li>• 真诚与善意</li>
                <li>• 成长与支持</li>
                <li>• 隐私与安全</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-black mb-4">平台特色</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• 匿名吐槽，释放压力</li>
                <li>• 理性辩论，拓展思维</li>
                <li>• 生活分享，记录美好</li>
                <li>• 热点资讯，把握时事</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-black mb-4">安全保障</h2>
              <p className="text-gray-700 leading-relaxed">
                我们采用严格的身份验证机制，确保社区的纯净性。所有用户信息都经过加密保护，匿名功能确保隐私安全。
              </p>
            </div>
          </div>

          <div className="text-center pt-8">
            <p className="text-xl font-medium text-black">
              她至关重要
            </p>
            <p className="text-gray-600 mt-2">
              我们重视你的每一步成长，也心疼你的每一个迷茫
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;