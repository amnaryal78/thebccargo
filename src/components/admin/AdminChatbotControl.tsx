import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Settings, 
  BookOpen, 
  ShieldAlert, 
  Wrench, 
  MessageSquare, 
  BarChart3, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Eye,
  Sliders
} from 'lucide-react';
import { 
  ChatbotSettings, 
  KnowledgeItem, 
  ChatbotRule, 
  ChatbotTool, 
  ChatbotSuggestion,
  ChatStats,
  KnowledgeCategory
} from '../../types/chatbot';
import { 
  getChatbotSettings, 
  saveChatbotSettings, 
  getKnowledgeItems, 
  saveKnowledgeItem, 
  deleteKnowledgeItem, 
  getRules, 
  saveRule, 
  getTools, 
  toggleTool, 
  getSuggestions, 
  saveSuggestion, 
  deleteSuggestion, 
  getChatStats,
  processChatMessage
} from '../../services/chatbotService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Switch } from '../ui/Switch';
import { Dialog } from '../ui/Dialog';

export const AdminChatbotControl: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'knowledge' | 'rules' | 'tools' | 'suggestions' | 'preview'>('settings');

  // Operational Data States
  const [settings, setSettings] = useState<ChatbotSettings>(() => getChatbotSettings());
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>(() => getKnowledgeItems());
  const [rules, setRules] = useState<ChatbotRule[]>(() => getRules());
  const [tools, setTools] = useState<ChatbotTool[]>(() => getTools());
  const [suggestions, setSuggestions] = useState<ChatbotSuggestion[]>(() => getSuggestions());
  const [stats, setStats] = useState<ChatStats>(() => getChatStats());

  // Filter & Modal States
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<Partial<KnowledgeItem>>({});

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<ChatbotRule>>({});

  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<Partial<ChatbotSuggestion>>({});

  // Live Test Drawer State
  const [testQuery, setTestQuery] = useState('');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveChatbotSettings(settings);
    showToast('Chatbot settings updated successfully!');
  };

  const handleSaveKnowledge = () => {
    if (!editingKnowledge.title || !editingKnowledge.content) return;
    const item: KnowledgeItem = {
      id: editingKnowledge.id || `k-${Date.now()}`,
      title: editingKnowledge.title,
      category: (editingKnowledge.category as KnowledgeCategory) || 'company',
      content: editingKnowledge.content,
      enabled: editingKnowledge.enabled !== undefined ? editingKnowledge.enabled : true,
      priority: editingKnowledge.priority || 1,
      updatedAt: new Date().toISOString(),
    };
    const updated = saveKnowledgeItem(item);
    setKnowledge(updated);
    setIsKnowledgeModalOpen(false);
    setEditingKnowledge({});
    showToast('Knowledge base item saved!');
  };

  const handleDeleteKnowledge = (id: string) => {
    if (confirm('Are you sure you want to delete this knowledge item?')) {
      const updated = deleteKnowledgeItem(id);
      setKnowledge(updated);
      showToast('Knowledge item deleted.');
    }
  };

  const handleSaveRule = () => {
    if (!editingRule.name || !editingRule.content) return;
    const rule: ChatbotRule = {
      id: editingRule.id || `r-${Date.now()}`,
      name: editingRule.name,
      type: editingRule.type || 'allowed_topic',
      content: editingRule.content,
      enabled: editingRule.enabled !== undefined ? editingRule.enabled : true,
    };
    const updated = saveRule(rule);
    setRules(updated);
    setIsRuleModalOpen(false);
    setEditingRule({});
    showToast('Chatbot rule updated!');
  };

  const handleToggleTool = (id: string, enabled: boolean) => {
    const updated = toggleTool(id, enabled);
    setTools(updated);
    showToast(`Tool ${enabled ? 'enabled' : 'disabled'}.`);
  };

  const handleSaveSuggestion = () => {
    if (!editingSuggestion.text) return;
    const item: ChatbotSuggestion = {
      id: editingSuggestion.id || `s-${Date.now()}`,
      text: editingSuggestion.text,
      category: editingSuggestion.category || 'general',
      enabled: editingSuggestion.enabled !== undefined ? editingSuggestion.enabled : true,
    };
    const updated = saveSuggestion(item);
    setSuggestions(updated);
    setIsSuggestionModalOpen(false);
    setEditingSuggestion({});
    showToast('Suggested question updated!');
  };

  const handleDeleteSuggestion = (id: string) => {
    const updated = deleteSuggestion(id);
    setSuggestions(updated);
    showToast('Suggested question removed.');
  };

  const handleRunLiveTest = async () => {
    if (!testQuery.trim()) return;
    setIsTesting(true);
    setTestResponse(null);
    try {
      const res = await processChatMessage(testQuery);
      setTestResponse(res.text);
    } catch (e: any) {
      setTestResponse('Test error: ' + e.message);
    } finally {
      setIsTesting(false);
    }
  };

  const filteredKnowledge = knowledge.filter(k => {
    const matchesSearch = k.title.toLowerCase().includes(knowledgeSearch.toLowerCase()) || 
                          k.content.toLowerCase().includes(knowledgeSearch.toLowerCase());
    const matchesCat = selectedCategory === 'all' || k.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0B5ED7]/10 text-[#0B5ED7] flex items-center justify-center font-bold">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-xl text-slate-900">
                AI Chatbot Control Center
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${settings.enabled ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-red-500/15 text-red-700'}`}>
                {settings.enabled ? 'Active • Controlled' : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage approved BC Cargo knowledge base, rules engine, agentic tools, model parameters &amp; live test preview.
            </p>
          </div>
        </div>

        {/* Global Enable Toggle */}
        <div className="flex items-center gap-3 bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-700 font-mono">
            Enable Chatbot
          </span>
          <Switch
            checked={settings.enabled}
            onChange={(checked: boolean) => {
              const updated = { ...settings, enabled: checked };
              setSettings(updated);
              saveChatbotSettings(updated);
              showToast(`Chatbot ${checked ? 'enabled' : 'disabled'}`);
            }}
          />
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Total Messages</span>
          <p className="font-heading font-extrabold text-2xl text-slate-900 mt-1">{stats.totalMessages}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Approved Knowledge</span>
          <p className="font-heading font-extrabold text-2xl text-[#0B5ED7] mt-1">{knowledge.length} Items</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Out-of-Scope Fallbacks</span>
          <p className="font-heading font-extrabold text-2xl text-amber-500 mt-1">{stats.fallbackCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Tool Executions</span>
          <p className="font-heading font-extrabold text-2xl text-[#10B981] mt-1">{stats.toolExecutionCount}</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'settings', label: 'General & Provider', icon: Settings },
          { id: 'knowledge', label: `Knowledge Base (${knowledge.length})`, icon: BookOpen },
          { id: 'rules', label: `Rules Engine (${rules.length})`, icon: ShieldAlert },
          { id: 'tools', label: `Agentic Tools (${tools.filter(t=>t.enabled).length}/${tools.length})`, icon: Wrench },
          { id: 'suggestions', label: 'Suggested Questions', icon: MessageSquare },
          { id: 'preview', label: 'Live Test & Preview', icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#0B5ED7] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: GENERAL & AI PROVIDER SETTINGS */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="font-heading font-bold text-lg text-slate-900">Chatbot Interface &amp; Messaging Settings</h3>
            <p className="text-xs text-slate-500">Configure welcome messages, fallback responses, and assistant metadata.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chatbot Name</label>
              <Input
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="BC Cargo AI"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Input Placeholder</label>
              <Input
                value={settings.inputPlaceholder}
                onChange={(e) => setSettings({ ...settings, inputPlaceholder: e.target.value })}
                placeholder="Ask me something about BC Cargo..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Welcome Message</label>
              <Textarea
                rows={2}
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Controlled Out-of-Scope Fallback Message (Strict BC Cargo Boundary)</label>
              <Textarea
                rows={2}
                value={settings.fallbackMessage}
                onChange={(e) => setSettings({ ...settings, fallbackMessage: e.target.value })}
              />
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Returned whenever user asks non-BC Cargo questions (e.g., politics, coding, medical, general AI).
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-heading font-bold text-lg text-slate-900">AI Provider &amp; Model Architecture</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">All AI calls are routed strictly server-side. API keys remain server environment secrets.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">AI Provider</label>
                <select
                  value={settings.provider}
                  onChange={(e) => setSettings({ ...settings, provider: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                >
                  <option value="openrouter">OpenRouter Server API (Recommended)</option>
                  <option value="gemini">Google Gemini API</option>
                  <option value="deterministic">Deterministic Engine Only (Offline Safe)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">AI Model Selection</label>
                <select
                  value={settings.model}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                >
                  <option value="google/gemma-4-26b-a4b-it:free">google/gemma-4-26b-a4b-it:free (Fast &amp; Free)</option>
                  <option value="openai/gpt-oss-20b">openai/gpt-oss-20b</option>
                  <option value="openrouter/free">openrouter/free auto fallback</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Response Tokens</label>
                <Input
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) || 400 })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-[#0B5ED7] hover:bg-[#084298] text-white flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>Save Chatbot Settings</span>
            </Button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: KNOWLEDGE BASE MANAGER */}
      {activeSubTab === 'knowledge' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">Approved BC Cargo Knowledge Base</h3>
              <p className="text-xs text-slate-500">The chatbot is strictly restricted to answer from these verified items.</p>
            </div>
            <Button 
              onClick={() => {
                setEditingKnowledge({});
                setIsKnowledgeModalOpen(true);
              }}
              className="bg-[#0B5ED7] hover:bg-[#084298] text-white text-xs flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Knowledge Item</span>
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Input
              placeholder="Search knowledge title or content..."
              value={knowledgeSearch}
              onChange={(e) => setKnowledgeSearch(e.target.value)}
              className="flex-1"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
            >
              <option value="all">All Categories</option>
              <option value="company">Company</option>
              <option value="contact">Contact</option>
              <option value="locations">Locations</option>
              <option value="services">Services</option>
              <option value="destinations">Destinations</option>
              <option value="pickup">Pickup</option>
              <option value="rates">Rates</option>
              <option value="tracking">Tracking</option>
              <option value="policies">Policies</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 font-mono uppercase text-[10px] text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Content Snippet</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredKnowledge.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-[10px] uppercase font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{item.title}</td>
                    <td className="p-3 max-w-md truncate text-slate-500">{item.content}</td>
                    <td className="p-3 font-mono font-bold text-[#0B5ED7]">P{item.priority}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.enabled ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-slate-500/20 text-slate-400'}`}>
                        {item.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingKnowledge(item);
                          setIsKnowledgeModalOpen(true);
                        }}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteKnowledge(item.id)}
                        className="p-1.5 rounded hover:bg-red-500/15 text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: RULES ENGINE */}
      {activeSubTab === 'rules' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">Admin Control Rules</h3>
              <p className="text-xs text-slate-500">Specify allowed topics, blocked queries, escalation rules and price restrictions.</p>
            </div>
            <Button
              onClick={() => {
                setEditingRule({});
                setIsRuleModalOpen(true);
              }}
              className="bg-[#0B5ED7] hover:bg-[#084298] text-white text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Rule</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div key={rule.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#0B5ED7]/20 text-[#60A5FA] font-bold">
                      {rule.type}
                    </span>
                    <Switch
                      checked={rule.enabled}
                      onChange={(checked: boolean) => {
                        rule.enabled = checked;
                        saveRule(rule);
                        setRules([...rules]);
                      }}
                    />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-slate-900 mt-2">{rule.name}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rule.content}</p>
                </div>

                <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setEditingRule(rule);
                      setIsRuleModalOpen(true);
                    }}
                    className="text-xs text-[#0B5ED7] hover:underline"
                  >
                    Edit Rule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: AGENTIC TOOLS */}
      {activeSubTab === 'tools' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900">Initial Approved Agentic Tools</h3>
            <p className="text-xs text-slate-500">Toggle individual permitted tool functions accessible to the chatbot engine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((t) => (
              <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#0B5ED7]">{t.name}()</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${t.enabled ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-slate-500/20 text-slate-400'}`}>
                      {t.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{t.description}</p>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">Schema: {t.parametersSchema}</span>
                </div>

                <Switch
                  checked={t.enabled}
                  onChange={(checked: boolean) => handleToggleTool(t.id, checked)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: SUGGESTED QUESTIONS */}
      {activeSubTab === 'suggestions' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">Suggested Question Chips</h3>
              <p className="text-xs text-slate-500">Quick-click sample prompts displayed at the bottom of the customer chat UI.</p>
            </div>
            <Button
              onClick={() => {
                setEditingSuggestion({});
                setIsSuggestionModalOpen(true);
              }}
              className="bg-[#0B5ED7] hover:bg-[#084298] text-white text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </Button>
          </div>

          <div className="space-y-3">
            {suggestions.map((s) => (
              <div key={s.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-[#F5C84C]" />
                  <span className="text-xs font-semibold text-slate-900 font-sans">{s.text}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-[9px] font-mono uppercase text-slate-500">
                    {s.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteSuggestion(s.id)}
                    className="p-1 rounded text-red-600 hover:bg-red-500/15"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: LIVE TEST & PREVIEW DRAWER */}
      {activeSubTab === 'preview' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900">Live Chatbot Console &amp; Draft Tester</h3>
            <p className="text-xs text-slate-500">Test how the chatbot responds to in-scope or out-of-scope queries in real time.</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type a test query (e.g., 'What are your rates to Korea?' or 'Who is prime minister?')"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunLiveTest()}
                className="flex-1"
              />
              <Button
                onClick={handleRunLiveTest}
                disabled={isTesting || !testQuery.trim()}
                className="bg-[#0B5ED7] hover:bg-[#084298] text-white flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run Test</span>
              </Button>
            </div>

            {/* Quick Test Prompt Chips */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 font-mono text-[10px]">Sample Tests:</span>
              <button
                onClick={() => { setTestQuery('Where is BC Cargo located?'); }}
                className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[11px]"
              >
                Location &amp; HQ
              </button>
              <button
                onClick={() => { setTestQuery('Track BC-90214-HKG'); }}
                className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[11px]"
              >
                Tracking Tool Test
              </button>
              <button
                onClick={() => { setTestQuery('Who is the prime minister of Nepal?'); }}
                className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-600 text-[11px]"
              >
                Out-of-Scope Fallback Test
              </button>
            </div>

            {testResponse && (
              <div className="p-4 rounded-xl bg-slate-900 text-white font-sans text-xs sm:text-sm border border-slate-700 space-y-2">
                <span className="text-[10px] font-mono text-[#60A5FA] uppercase font-bold block">Live Assistant Output:</span>
                <div className="whitespace-pre-wrap">{testResponse}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KNOWLEDGE MODAL */}
      <Dialog isOpen={isKnowledgeModalOpen} onClose={() => setIsKnowledgeModalOpen(false)}>
        <div className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-lg text-slate-900">
            {editingKnowledge.id ? 'Edit Knowledge Item' : 'Add Knowledge Item'}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
              <Input
                value={editingKnowledge.title || ''}
                onChange={(e) => setEditingKnowledge({ ...editingKnowledge, title: e.target.value })}
                placeholder="e.g. Kathmandu Hub Operating Hours"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={editingKnowledge.category || 'company'}
                onChange={(e) => setEditingKnowledge({ ...editingKnowledge, category: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
              >
                <option value="company">Company</option>
                <option value="contact">Contact</option>
                <option value="locations">Locations</option>
                <option value="services">Services</option>
                <option value="destinations">Destinations</option>
                <option value="pickup">Pickup</option>
                <option value="rates">Rates</option>
                <option value="offers">Offers</option>
                <option value="tracking">Tracking</option>
                <option value="packaging">Packaging</option>
                <option value="policies">Policies</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Knowledge Content</label>
              <Textarea
                rows={4}
                value={editingKnowledge.content || ''}
                onChange={(e) => setEditingKnowledge({ ...editingKnowledge, content: e.target.value })}
                placeholder="Detailed approved knowledge content..."
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-xs font-semibold text-slate-700">Active Status</label>
              <Switch
                checked={editingKnowledge.enabled !== false}
                onChange={(checked: boolean) => setEditingKnowledge({ ...editingKnowledge, enabled: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsKnowledgeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveKnowledge} className="bg-[#0B5ED7] text-white">Save Item</Button>
          </div>
        </div>
      </Dialog>

      {/* RULE MODAL */}
      <Dialog isOpen={isRuleModalOpen} onClose={() => setIsRuleModalOpen(false)}>
        <div className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-lg text-slate-900">
            {editingRule.id ? 'Edit Chatbot Rule' : 'Add Chatbot Rule'}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Name</label>
              <Input
                value={editingRule.name || ''}
                onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                placeholder="e.g. Rate Disclosure Warning"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Type</label>
              <select
                value={editingRule.type || 'allowed_topic'}
                onChange={(e) => setEditingRule({ ...editingRule, type: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
              >
                <option value="allowed_topic">Allowed Topic</option>
                <option value="blocked_topic">Blocked Topic</option>
                <option value="disallowed_claim">Disallowed Claim</option>
                <option value="escalation">Escalation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Description / Instruction</label>
              <Textarea
                rows={3}
                value={editingRule.content || ''}
                onChange={(e) => setEditingRule({ ...editingRule, content: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsRuleModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRule} className="bg-[#0B5ED7] text-white">Save Rule</Button>
          </div>
        </div>
      </Dialog>

      {/* SUGGESTION MODAL */}
      <Dialog isOpen={isSuggestionModalOpen} onClose={() => setIsSuggestionModalOpen(false)}>
        <div className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-lg text-slate-900">Suggested Question</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Question Prompt</label>
            <Input
              value={editingSuggestion.text || ''}
              onChange={(e) => setEditingSuggestion({ ...editingSuggestion, text: e.target.value })}
              placeholder="e.g. Which countries do you serve?"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsSuggestionModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSuggestion} className="bg-[#0B5ED7] text-white">Save Prompt</Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
};
