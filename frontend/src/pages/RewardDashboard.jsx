import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { get, post } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function RewardsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    if (user?._id) {
      loadRewardsData();
    }
  }, [user]);

  const loadRewardsData = async () => {
    try {
      const res = await get(`/api/rewards/dashboard/${user._id}`, true);
      setAccount(res.account);
      setRewards(res.rewards || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId) => {
    try {
      setRedeeming(rewardId);
      setError('');
      setSuccess('');
      
      const res = await post('/api/rewards/redeem', {
        userId: user._id,
        rewardId
      }, true);

      if (res.result === 'INSUFFICIENT_POINTS') {
        setError('You do not have enough points to redeem this reward');
      } else if (res.result) {
        setSuccess(`Successfully redeemed: ${res.result.title}!`);
        await loadRewardsData();
      }
    } catch (err) {
      setError(err.message || 'Redemption failed');
    } finally {
      setRedeeming(null);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Bronze': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Silver': return 'text-gray-700 bg-gray-50 border-gray-300';
      case 'Gold': return 'text-yellow-700 bg-yellow-50 border-yellow-300';
      case 'Platinum': return 'text-purple-700 bg-purple-50 border-purple-300';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getLevelProgress = (points) => {
    const levels = [
      { name: 'Bronze', min: 0, max: 500 },
      { name: 'Silver', min: 500, max: 1500 },
      { name: 'Gold', min: 1500, max: 3000 },
      { name: 'Platinum', min: 3000, max: Infinity }
    ];
    
    const currentLevel = levels.find(l => points >= l.min && points < l.max);
    if (!currentLevel) return { percent: 100, next: null, needed: 0 };
    
    if (currentLevel.name === 'Platinum') {
      return { percent: 100, next: null, needed: 0 };
    }
    
    const progress = points - currentLevel.min;
    const range = currentLevel.max - currentLevel.min;
    const percent = Math.min((progress / range) * 100, 100);
    const nextLevel = levels.find(l => l.min === currentLevel.max);
    
    return {
      percent: Math.round(percent),
      next: nextLevel?.name,
      needed: currentLevel.max - points
    };
  };

  const getRewardIcon = (type) => {
    switch (type) {
      case 'DISCOUNT': return '💰';
      case 'PRIORITY': return '⚡';
      case 'VOUCHER': return '🎁';
      default: return '🎯';
    }
  };

  const copyReferralCode = () => {
    if (account?.referralCode) {
      navigator.clipboard.writeText(account.referralCode);
      setSuccess('Referral code copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading rewards...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const progress = account ? getLevelProgress(account.points) : { percent: 0, next: null, needed: 0 };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rewards & Points</h1>
              <p className="text-gray-600 mt-1">Earn points and redeem exclusive rewards</p>
            </div>
            <Link to="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {error && <Alert type="error" message={error} className="mb-6" />}
        {success && <Alert type="success" message={success} className="mb-6" />}

        {/* Points Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Points Balance</h2>
                  <p className="text-gray-600 mt-1">Keep earning to unlock more rewards</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600">{account?.points || 0}</div>
                  <div className="text-sm text-gray-500">Total Points</div>
                </div>
              </div>

              {/* Level Badge */}
              <div className="mb-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 ${getLevelColor(account?.level || 'Bronze')}`}>
                  <span className="text-2xl mr-2">
                    {account?.level === 'Bronze' && '🥉'}
                    {account?.level === 'Silver' && '🥈'}
                    {account?.level === 'Gold' && '🥇'}
                    {account?.level === 'Platinum' && '💎'}
                  </span>
                  <span className="font-bold text-lg">{account?.level || 'Bronze'} Member</span>
                </div>
              </div>

              {/* Progress Bar */}
              {progress.next && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress to {progress.next}</span>
                    <span className="font-medium text-gray-900">{progress.needed} points needed</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress.percent}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{progress.percent}% complete</div>
                </div>
              )}

              {/* Ways to Earn */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Ways to Earn Points</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">🚗</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Complete Rides</div>
                      <div className="text-sm text-gray-600">+50 points as driver</div>
                      <div className="text-sm text-gray-600">+30 points as passenger</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">⭐</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">High Ratings</div>
                      <div className="text-sm text-gray-600">+20 points for 4.5★+</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">👥</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Referrals</div>
                      <div className="text-sm text-gray-600">+100 points per friend</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Referral Card */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Friends</h3>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">Your Referral Code</div>
                <div className="flex items-center justify-between bg-white rounded px-3 py-2 border border-gray-200">
                  <code className="font-mono font-bold text-lg text-blue-600">
                    {account?.referralCode || 'N/A'}
                  </code>
                  <button
                    onClick={copyReferralCode}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-600">Share your code with friends</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-600">They sign up using your code</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-600">You both earn 100 bonus points!</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">Successful Referrals</div>
                <div className="text-2xl font-bold text-gray-900">
                  {account?.referredUsers?.length || 0}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Rewards Catalog */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Redeem Your Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <Card key={reward._id}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{getRewardIcon(reward.type)}</div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Points Required</div>
                      <div className="text-2xl font-bold text-blue-600">{reward.pointsRequired}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{reward.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                  
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      reward.type === 'DISCOUNT' ? 'bg-green-100 text-green-800' :
                      reward.type === 'PRIORITY' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {reward.type}
                    </span>
                  </div>

                  <Button
                    variant={account?.points >= reward.pointsRequired ? 'primary' : 'outline'}
                    className="w-full"
                    onClick={() => handleRedeem(reward._id)}
                    disabled={account?.points < reward.pointsRequired || redeeming === reward._id}
                  >
                    {redeeming === reward._id ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Redeeming...
                      </span>
                    ) : account?.points >= reward.pointsRequired ? (
                      'Redeem Now'
                    ) : (
                      `Need ${reward.pointsRequired - (account?.points || 0)} more points`
                    )}
                  </Button>
                </div>
              </Card>
            ))}

            {rewards.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🎁</div>
                <p className="text-lg">No rewards available at this time</p>
                <p className="text-sm">Check back later for exciting rewards!</p>
              </div>
            )}
          </div>
        </div>

        {/* Points History */}
        {account?.history && account.history.length > 0 && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Points History</h2>
              <div className="space-y-3">
                {account.history.slice(0, 10).reverse().map((entry, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        entry.points > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {entry.points > 0 ? '↑' : '↓'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{entry.action}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      entry.points > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {entry.points > 0 ? '+' : ''}{entry.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
}