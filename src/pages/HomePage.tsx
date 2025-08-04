import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, Calendar, Newspaper, Heart, TrendingUp } from 'lucide-react';

const HomePage: React.FC = () => {
  const quickActions = [
    {
      icon: MessageSquare,
      title: '匿名吐槽',
      description: '释放今天的不顺利',
      path: '/confession',
      color: 'bg-black text-white'
    },
    {
      icon: Users,
      title: '辩论空间',
      description: '分享你的观点',
      path: '/debate',
      color: 'bg-gray-100 text-black'
    },
    {
      icon: Calendar,
      title: '点滴日常',
      description: '记录美好时光',
      path: '/daily',
      color: 'bg-gray-100 text-black'
    },
    {
      icon: Newspaper,
      title: '热点资讯',
      description: '了解最新动态',
      path: '/news',
      color: 'bg-gray-100 text-black'
    }
  ];

  const stats = [
    { label: '今日新增话题', value: '28', icon: TrendingUp },
    { label: '活跃用户', value: '1.2k', icon: Users },
    { label: '温暖互动', value: '5.6k', icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-8 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-black mb-2">欢迎回来</h1>
        <p className="text-gray-600">让我们一起创造温暖的社区氛围</p>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-6">
        <h2 className="text-lg font-semibold text-black mb-4">快捷入口</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.path}
                className={`${action.color} p-6 rounded-2xl transition-all duration-200 active:scale-95 hover:shadow-lg`}
              >
                <Icon className="w-8 h-8 mb-3" />
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-sm opacity-80">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Community Stats */}
      <div className="px-6 py-6">
        <h2 className="text-lg font-semibold text-black mb-4">社区动态</h2>
        <div className="bg-white rounded-2xl p-6 space-y-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-gray-700">{stat.label}</span>
                </div>
                <span className="text-xl font-bold text-black">{stat.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Quote */}
      <div className="px-6 py-6">
        <div className="bg-black text-white rounded-2xl p-6 text-center">
          <h3 className="font-semibold mb-2">每日寄语</h3>
          <p className="text-gray-300 leading-relaxed">
            "她至关重要。我们重视你的每一步成长，也心疼你的每一个迷茫。"
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">最近活动</h2>
          <Link to="/confession-list" className="text-sm text-black hover:opacity-70">
            查看全部
          </Link>
        </div>
        
        <div className="space-y-3">
          {[
            { tag: '#职场', preview: '今天的会议真的让人很累...', time: '2分钟前' },
            { tag: '#情感', preview: '有时候真的不知道该如何表达...', time: '15分钟前' },
            { tag: '#生活感悟', preview: '每天都是新的开始...', time: '1小时前' }
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
                  {item.tag}
                </span>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm mb-1">{item.preview}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;