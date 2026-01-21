
import React, { useState, useEffect, useMemo } from 'react';
import { CuisineType, Recipe, Language, CookingMethod, CookingTime, RecipeStep } from './types';
import { generateRecipe, generateImage, critiqueFinishedDish } from './services/geminiService';
import { 
  Plus, 
  ChefHat, 
  UtensilsCrossed, 
  BookOpen, 
  Trash2, 
  Camera, 
  Star, 
  Loader2,
  X,
  Languages,
  Flame,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  LayoutGrid,
  Activity,
  User,
  ChevronLeft,
  Cake,
  Soup as SoupIcon,
  Pizza,
  Zap,
  Coffee,
  Trophy,
  Users,
  AlertTriangle,
  Ban
} from 'lucide-react';

const KiwiGirlIcon = ({ size = 24 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-sm"
  >
    {/* Girl's Head/Hair Silhouette - Original Design */}
    <path 
      d="M20 5C11.7157 5 5 11.7157 5 20C5 23.3137 6.08629 26.3731 7.92893 28.8411C8.59129 29.728 9.34571 30.5404 10.1818 31.2657C12.7667 33.5086 16.2238 34.875 20 34.875C23.7762 34.875 27.2333 33.5086 29.8182 31.2657C30.6543 30.5404 31.4087 29.728 32.0711 28.8411C33.9137 26.3731 35 23.3137 35 20C35 11.7157 28.2843 5 20 5Z" 
      fill="#4A3728" 
    />
    <circle cx="20" cy="22" r="11" fill="#FFE0BD" />
    {/* Kiwi "Hat" or Hair Decoration */}
    <circle cx="28" cy="12" r="8" fill="#8DB600" stroke="#4A3728" strokeWidth="1.5" />
    <circle cx="28" cy="12" r="3.5" fill="#E8F5E9" />
    <circle cx="28" cy="10" r="0.8" fill="#333" />
    <circle cx="30" cy="12" r="0.8" fill="#333" />
    <circle cx="28" cy="14" r="0.8" fill="#333" />
    <circle cx="26" cy="12" r="0.8" fill="#333" />
    {/* Facial Features (Simple) */}
    <path d="M16 22C16 22 17 23 18 22" stroke="#4A3728" strokeWidth="1" strokeLinecap="round" />
    <path d="M22 22C22 22 23 23 24 22" stroke="#4A3728" strokeWidth="1" strokeLinecap="round" />
    <path d="M18 26C19 27.5 21 27.5 22 26" stroke="#4A3728" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const TRANSLATIONS = {
  en: {
    appName: "KW Kitchen",
    newRecipe: "New Recipe",
    discover: "Discover",
    myKitchen: "My Kitchen",
    all: "All",
    fridgePrompt: "What's in your fridge?",
    fridgeSub: "Tell us your ingredients and our AI will craft a signature recipe just for you.",
    startCreating: "Start Creating",
    noRecipes: "No recipes found.",
    newCreation: "New Creation",
    selectCuisine: "Cuisine Style",
    selectMethod: "Cooking Method",
    selectTime: "Prep Time",
    fineDining: "Fine Dining Mode",
    fineDiningSub: "Maximum difficulty & elite techniques",
    ingredientLabel: "What ingredients do you have?",
    excludedLabel: "Excluded Ingredients (Optional)",
    servingsLabel: "Servings",
    ingredientPlaceholder: "e.g. Chicken, Flour, Cream...",
    excludedPlaceholder: "e.g. Peanuts, Cilantro, Dairy...",
    generating: "AI is cooking...",
    generateBtn: "Generate Recipe",
    ingredients: "Ingredients",
    steps: "Cooking Steps",
    editPrompt: "Edit Prompt",
    saveToKitchen: "Save to My Kitchen",
    yourProgress: "Your Progress",
    finishedCooking: "Finished?",
    uploadSub: "Upload a photo for AI review.",
    uploadResult: "Upload Result",
    analyzing: "Analyzing...",
    aiRating: "AI Rating",
    expertTips: "Expert Tips",
    completed: "Completed",
    remove: "Remove",
    deleteConfirm: "Delete this recipe?",
    any: "Any",
    groupBy: "Group By",
    cuisine: "Style",
    method: "Method",
    difficulty: "Difficulty",
    back: "Back",
    portion: "Portion",
    incompatibleTitle: "Wait a moment!",
    incompatibleSub: "Our chef suggests this combination might not work well:",
    tryAgain: "Adjust Ingredients",
    cuisines: {
      [CuisineType.CHINESE]: "Chinese",
      [CuisineType.WESTERN]: "Western",
      [CuisineType.JAPANESE]: "Japanese",
      [CuisineType.CAKE]: "Cake",
      [CuisineType.SOUP]: "Soup",
    },
    methods: {
      [CookingMethod.PAN_FRY]: "Pan-fry",
      [CookingMethod.BAKE]: "Bake",
      [CookingMethod.ROAST]: "Roast",
      [CookingMethod.STEAM]: "Steam",
      [CookingMethod.BRAISE]: "Braise",
      [CookingMethod.STEW]: "Stew",
      [CookingMethod.BOIL]: "Boil",
    },
    times: {
      [CookingTime.QUICK]: "Quick",
      [CookingTime.MEDIUM]: "Standard",
      [CookingTime.SLOW]: "Slow",
    }
  },
  zh: {
    appName: "KW 廚房",
    newRecipe: "新增食譜",
    discover: "探索",
    myKitchen: "我的廚房",
    all: "全部",
    fridgePrompt: "你的冰箱裡有什麼？",
    fridgeSub: "告訴我們你現有的食材，AI 將為你設計專屬配方。",
    startCreating: "開始創作",
    noRecipes: "暫無食譜。",
    newCreation: "全新創作",
    selectCuisine: "風格選擇",
    selectMethod: "烹調方式",
    selectTime: "預計時間",
    fineDining: "精緻料理模式",
    fineDiningSub: "最高難度、極致創意與頂尖技巧",
    ingredientLabel: "主要食材",
    excludedLabel: "不想選用的食材 (選填)",
    servingsLabel: "份量",
    ingredientPlaceholder: "例如：雞肉, 麵粉, 奶油, 草莓...",
    excludedPlaceholder: "例如：花生, 芫荽, 奶製品...",
    generating: "AI 正在研製中...",
    generateBtn: "生成食譜",
    ingredients: "所需材料",
    steps: "烹飪步驟",
    editPrompt: "修改需求",
    saveToKitchen: "儲存到我的廚房",
    yourProgress: "我的進度",
    finishedCooking: "完成了嗎？",
    uploadSub: "上傳成果獲取 AI 改良建議。",
    uploadResult: "上傳成果",
    analyzing: "分析中...",
    aiRating: "AI 評分",
    expertTips: "專業建議",
    completed: "已完成",
    remove: "移除",
    deleteConfirm: "確定要刪除這個食譜嗎？",
    any: "不限",
    groupBy: "分類依據",
    cuisine: "風格",
    method: "方法",
    difficulty: "難度",
    back: "返回",
    portion: "份量",
    incompatibleTitle: "請稍等！",
    incompatibleSub: "廚師認為這個搭配可能不太合適：",
    tryAgain: "調整材料",
    cuisines: {
      [CuisineType.CHINESE]: "中菜",
      [CuisineType.WESTERN]: "西餐",
      [CuisineType.JAPANESE]: "日料",
      [CuisineType.CAKE]: "蛋糕",
      [CuisineType.SOUP]: "湯品",
    },
    methods: {
      [CookingMethod.PAN_FRY]: "煎",
      [CookingMethod.BAKE]: "焗",
      [CookingMethod.ROAST]: "烤",
      [CookingMethod.STEAM]: "蒸",
      [CookingMethod.BRAISE]: "炆",
      [CookingMethod.STEW]: "燉",
      [CookingMethod.BOIL]: "煮",
    },
    times: {
      [CookingTime.QUICK]: "快速 (<30m)",
      [CookingTime.MEDIUM]: "標準 (30-60m)",
      [CookingTime.SLOW]: "慢煮 (>60m)",
    }
  }
};

const CuisineIcons = {
  [CuisineType.CHINESE]: <UtensilsCrossed size={20} />,
  [CuisineType.WESTERN]: <Pizza size={20} />,
  [CuisineType.JAPANESE]: <Coffee size={20} />,
  [CuisineType.CAKE]: <Cake size={20} />,
  [CuisineType.SOUP]: <SoupIcon size={20} />,
  'All': <LayoutGrid size={20} />
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('zh');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'my-kitchen'>('discover');
  
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType | 'All'>(CuisineType.WESTERN);
  const [selectedMethod, setSelectedMethod] = useState<CookingMethod | 'Any'>('Any');
  const [selectedTime, setSelectedTime] = useState<CookingTime | 'Any'>('Any');
  const [servings, setServings] = useState(3);
  const [isFineDining, setIsFineDining] = useState(false);
  
  const [isCreating, setIsCreating] = useState(false);
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [excludedInput, setExcludedInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentCreation, setCurrentCreation] = useState<Partial<Recipe> | null>(null);
  const [incompatibilityMsg, setIncompatibilityMsg] = useState<string | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [groupBy, setGroupBy] = useState<'cuisine' | 'method'>('cuisine');

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const saved = localStorage.getItem('gourmet-recipes');
    const savedLang = localStorage.getItem('gourmet-lang') as Language;
    if (saved) setRecipes(JSON.parse(saved));
    if (savedLang) setLanguage(savedLang);
  }, []);

  useEffect(() => {
    localStorage.setItem('gourmet-recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('gourmet-lang', language);
  }, [language]);

  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'zh' : 'en');

  const handleGenerate = async () => {
    if (!ingredientsInput.trim()) return;
    setLoading(true);
    setIncompatibilityMsg(null);
    try {
      const cuisine = selectedCuisine === 'All' ? CuisineType.WESTERN : selectedCuisine;
      const method = selectedMethod === 'Any' ? undefined : selectedMethod;
      const time = selectedTime === 'Any' ? undefined : selectedTime;
      
      const result = await generateRecipe(
        ingredientsInput.split(','), 
        excludedInput.split(','),
        cuisine, 
        method, 
        time,
        servings,
        isFineDining,
        language
      );
      
      if (!result.isValid) {
        setIncompatibilityMsg(result.incompatibilityMessage || "Invalid combination.");
        setLoading(false);
        return;
      }

      const recipeData = result.recipe!;
      const mainImageUrl = await generateImage(recipeData.previewPrompt || recipeData.title || '', 'main');
      
      const recipeWithId: Partial<Recipe> = {
        ...recipeData,
        id: Date.now().toString(),
        cuisine: cuisine,
        method: method,
        time: time,
        servings: servings,
        isFineDining: isFineDining,
        imageUrl: mainImageUrl,
        createdAt: Date.now()
      };

      setCurrentCreation(recipeWithId);
      setLoading(false);

      if (recipeWithId.steps) {
        const updatedSteps = [...(recipeWithId.steps as RecipeStep[])];
        for (let i = 0; i < updatedSteps.length; i++) {
          const stepImg = await generateImage(updatedSteps[i].imagePrompt || updatedSteps[i].text, 'step');
          updatedSteps[i] = { ...updatedSteps[i], imageUrl: stepImg };
          setCurrentCreation(prev => prev ? ({ ...prev, steps: [...updatedSteps] }) : null);
        }
      }

    } catch (err) {
      console.error(err);
      alert(language === 'zh' ? '發生錯誤，請重試。' : 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleSaveRecipe = () => {
    if (currentCreation) {
      setRecipes(prev => [currentCreation as Recipe, ...prev]);
      setCurrentCreation(null);
      setIsCreating(false);
      setIngredientsInput('');
      setExcludedInput('');
      setActiveTab('my-kitchen');
    }
  };

  const resetCreation = () => {
    setIsCreating(false);
    setCurrentCreation(null);
    setIncompatibilityMsg(null);
    setIngredientsInput('');
    setExcludedInput('');
  };

  const handleDeleteRecipe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t.deleteConfirm)) {
      setRecipes(prev => prev.filter(r => r.id !== id));
      if (viewingRecipe?.id === id) setViewingRecipe(null);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, recipeId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setUploadingPhoto(true);
      try {
        const targetRecipe = recipes.find(r => r.id === recipeId);
        if (!targetRecipe) return;
        const review = await critiqueFinishedDish(targetRecipe, base64, language);
        setRecipes(prev => prev.map(r => 
          r.id === recipeId ? { ...r, userPhoto: base64, aiReview: review, completedAt: Date.now() } : r
        ));
        setViewingRecipe(prev => prev ? ({ ...prev, userPhoto: base64, aiReview: review, completedAt: Date.now() }) : null);
      } catch (err) {
        console.error(err);
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const groupedRecipes = useMemo(() => {
    const groups: Record<string, Recipe[]> = {};
    const baseRecipes = recipes.filter(r => selectedCuisine === 'All' || r.cuisine === selectedCuisine);
    baseRecipes.forEach(r => {
      const key = groupBy === 'cuisine' ? r.cuisine : (r.method || 'Unknown');
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return groups;
  }, [recipes, groupBy, selectedCuisine]);

  return (
    <div className="min-h-screen bg-[#fcfdfa] text-stone-900 selection:bg-green-100 selection:text-green-900">
      {/* Decorative */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-green-100/20 rounded-full blur-3xl" />
      <div className="fixed bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-lime-100/20 rounded-full blur-3xl" />

      {!currentCreation && (
        <header className="bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-500 to-lime-600 p-1 rounded-2xl text-white shadow-lg shadow-green-100 flex items-center justify-center">
              <KiwiGirlIcon size={38} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-green-900">{t.appName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} className="p-2 text-stone-500 hover:bg-stone-50 rounded-xl transition-all">
              <Languages size={18} />
            </button>
            <button onClick={() => { setIsCreating(true); }} className="bg-green-600 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 hover:bg-green-700 transition-all shadow-xl shadow-green-100 active:scale-95 text-xs font-black uppercase tracking-widest">
              <Plus size={16} strokeWidth={3} />
              {t.newRecipe}
            </button>
          </div>
        </header>
      )}

      {!currentCreation && (
        <main className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center justify-center mb-10">
            <div className="flex gap-1 bg-stone-100 p-1.5 rounded-2xl shadow-inner">
              <button onClick={() => setActiveTab('discover')} className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'discover' ? 'bg-white text-green-600 shadow-md scale-105' : 'text-stone-500 hover:text-stone-700'}`}>
                {t.discover}
              </button>
              <button onClick={() => setActiveTab('my-kitchen')} className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'my-kitchen' ? 'bg-white text-green-600 shadow-md scale-105' : 'text-stone-500 hover:text-stone-700'}`}>
                {t.myKitchen} <span className="ml-1 opacity-50">({recipes.length})</span>
              </button>
            </div>
          </div>

          <div className="mb-12 space-y-4">
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide px-2">
              {['All', ...Object.values(CuisineType)].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedCuisine(type as any)}
                  className={`flex flex-col items-center gap-3 min-w-[90px] p-5 rounded-[2.5rem] transition-all border-2 group ${
                    selectedCuisine === type 
                    ? 'bg-green-600 border-green-600 text-white shadow-2xl shadow-green-200 -translate-y-2' 
                    : 'bg-white border-white text-stone-400 hover:border-green-100 hover:shadow-lg'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedCuisine === type ? 'bg-white/20' : 'bg-stone-50 group-hover:bg-green-50 group-hover:text-green-500'}`}>
                    {CuisineIcons[type as keyof typeof CuisineIcons]}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${selectedCuisine === type ? 'text-white' : 'text-stone-500'}`}>
                    {type === 'All' ? t.all : t.cuisines[type as CuisineType]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'discover' ? (
            <section className="bg-stone-900 rounded-[3rem] p-16 overflow-hidden relative shadow-2xl group border border-stone-800">
               <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none group-hover:scale-105 transition-transform duration-1000">
                  <img src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" />
               </div>
               <div className="relative z-10 max-w-lg">
                  <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-8 border border-green-500/30">
                    <Sparkles size={14} /> AI Culinary Intelligence
                  </div>
                  <h2 className="text-5xl font-black text-white mb-6 leading-tight tracking-tight">{t.fridgePrompt}</h2>
                  <p className="text-stone-400 text-lg mb-10 leading-relaxed font-medium">{t.fridgeSub}</p>
                  <button onClick={() => setIsCreating(true)} className="bg-white text-stone-900 px-10 py-4.5 rounded-[2rem] font-black text-sm shadow-2xl hover:bg-green-600 hover:text-white transition-all active:scale-95 flex items-center gap-3 group/btn">
                    {t.startCreating}
                    <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
               </div>
            </section>
          ) : (
            <div className="space-y-16">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LayoutGrid size={20} className="text-green-500" />
                  <h3 className="text-xl font-black">{t.myKitchen}</h3>
                </div>
                <div className="flex items-center gap-4 bg-stone-100 p-1 rounded-2xl">
                    <button onClick={() => setGroupBy('cuisine')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${groupBy === 'cuisine' ? 'bg-white text-green-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>{t.cuisine}</button>
                    <button onClick={() => setGroupBy('method')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${groupBy === 'method' ? 'bg-white text-green-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>{t.method}</button>
                </div>
              </div>
              {Object.keys(groupedRecipes).length > 0 ? Object.entries(groupedRecipes).map(([groupName, groupItems]) => (
                <section key={groupName} className="space-y-8">
                  <div className="flex items-center gap-4">
                    <h4 className="text-sm font-black text-stone-400 uppercase tracking-[0.2em]">{groupBy === 'cuisine' ? t.cuisines[groupName as CuisineType] : (t.methods[groupName as CookingMethod] || groupName)}</h4>
                    <div className="h-[2px] flex-1 bg-stone-100/50" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {groupItems.map(recipe => (
                      <div key={recipe.id} onClick={() => setViewingRecipe(recipe)} className="bg-white rounded-[2.5rem] border border-stone-100 overflow-hidden group cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-2 relative">
                        <div className="relative h-64 overflow-hidden">
                          <img src={recipe.imageUrl || 'https://picsum.photos/400/400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <div className="px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl text-[9px] font-black text-stone-800 uppercase tracking-widest shadow-xl border border-white">
                              {recipe.isFineDining && <Sparkles size={10} className="text-amber-500 inline mr-1" />}
                              {t.cuisines[recipe.cuisine]}
                            </div>
                          </div>
                          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md text-stone-900 rounded-xl text-[10px] font-black shadow-xl">
                            <Activity size={12} className="text-green-600" /> {recipe.difficulty}/10
                          </div>
                        </div>
                        <div className="p-8">
                          <h3 className="text-xl font-black mb-3 text-stone-800 group-hover:text-green-600 transition-colors line-clamp-1">{recipe.title}</h3>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-stone-400 uppercase tracking-[0.1em] mb-6">
                             <div className="flex items-center gap-1.5"><Users size={12} className="text-green-200" /> {recipe.servings}P</div>
                             {recipe.time && <div className="flex items-center gap-1.5"><Clock size={12} className="text-green-200" /> {t.times[recipe.time]}</div>}
                          </div>
                          <div className="flex items-center justify-between border-t border-stone-50 pt-5">
                            <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{new Date(recipe.createdAt).toLocaleDateString()}</span>
                            <button onClick={(e) => handleDeleteRecipe(recipe.id, e)} className="text-stone-200 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )) : (
                <div className="py-24 text-center">
                  <p className="font-black text-stone-200 text-sm uppercase tracking-[0.3em]">{t.noRecipes}</p>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {currentCreation && (
        <div className="fixed inset-0 z-[60] bg-[#fcfdfa] flex flex-col animate-in fade-in duration-500">
          <div className="bg-white/90 backdrop-blur-xl border-b border-stone-100 px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
             <button onClick={() => setCurrentCreation(null)} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-black text-xs uppercase tracking-widest transition-all">
                <ChevronLeft size={20} /> {t.back}
             </button>
             <button onClick={handleSaveRecipe} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-stone-900 transition-all shadow-2xl shadow-green-100 active:scale-95">
                <BookOpen size={18} /> {t.saveToKitchen}
             </button>
          </div>

          <div className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-6xl mx-auto p-8 lg:p-16">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  <div className="lg:col-span-5 space-y-10">
                     <div className="relative rounded-[3rem] overflow-hidden shadow-2xl aspect-square bg-white border-8 border-white">
                        {currentCreation.imageUrl ? (
                           <img src={currentCreation.imageUrl} className="w-full h-full object-cover animate-in zoom-in-95 duration-700" />
                        ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 gap-4">
                              <Loader2 className="animate-spin text-green-400" size={40} />
                              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Capturing Essence...</span>
                           </div>
                        )}
                     </div>
                     <div className="flex flex-wrap gap-3">
                        <span className="px-5 py-2.5 bg-green-100 text-green-700 rounded-2xl text-[10px] font-black uppercase tracking-widest">{t.cuisines[currentCreation.cuisine as CuisineType]}</span>
                        {currentCreation.method && <span className="px-5 py-2.5 bg-stone-100 text-stone-700 rounded-2xl text-[10px] font-black uppercase tracking-widest">{t.methods[currentCreation.method as CookingMethod]}</span>}
                        {currentCreation.isFineDining && <span className="px-5 py-2.5 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Sparkles size={12} /> Fine Dining</span>}
                        <span className="px-5 py-2.5 bg-white border-2 border-stone-100 text-stone-900 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Activity size={12} className="text-green-500" /> {t.difficulty}: {currentCreation.difficulty}/10</span>
                        <span className="px-5 py-2.5 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Users size={12} /> {currentCreation.servings}P</span>
                     </div>
                  </div>

                  <div className="lg:col-span-7 space-y-16">
                     <div>
                        <h2 className="text-6xl font-black text-stone-900 mb-8 leading-none tracking-tight">{currentCreation.title}</h2>
                        <p className="text-stone-500 text-2xl italic font-medium leading-relaxed border-l-8 border-green-100 pl-8">"{currentCreation.description}"</p>
                     </div>

                     <div className="space-y-12">
                        <section>
                           <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                             <div className="w-2 h-2 bg-green-500 rounded-full" /> {t.ingredients}
                           </h3>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                              {currentCreation.ingredients?.map((ing, i) => (
                                <div key={i} className="flex justify-between border-b border-stone-100 pb-3 group">
                                   <span className="text-stone-700 font-bold group-hover:text-stone-900 transition-colors">{ing.item}</span>
                                   <span className="font-black text-green-600 tracking-tighter">{ing.amount}</span>
                                </div>
                              ))}
                           </div>
                        </section>

                        <section className="pt-12 border-t border-stone-100">
                           <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                             <div className="w-2 h-2 bg-green-500 rounded-full" /> {t.steps}
                           </h3>
                           <div className="space-y-12">
                              {currentCreation.steps?.map((step, i) => (
                                <div key={i} className="flex flex-col sm:flex-row gap-8 items-start group">
                                   <div className="flex-shrink-0 relative">
                                      <div className="w-32 h-32 rounded-3xl overflow-hidden bg-stone-100 shadow-lg border-4 border-white">
                                         {step.imageUrl ? (
                                            <img src={step.imageUrl} className="w-full h-full object-cover animate-in fade-in duration-1000" />
                                         ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                               <Loader2 className="animate-spin text-stone-200" size={24} />
                                            </div>
                                         )}
                                      </div>
                                      <span className="absolute -top-3 -left-3 w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-sm font-black shadow-xl border-4 border-[#fcfdfa]">
                                         {i+1}
                                      </span>
                                   </div>
                                   <div className="pt-2">
                                      <p className="text-stone-700 text-lg leading-relaxed font-semibold group-hover:text-stone-900 transition-colors">{step.text}</p>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </section>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {isCreating && !currentCreation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden flex flex-col max-h-[95vh] shadow-3xl">
            <div className="p-8 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <KiwiGirlIcon size={36} />
                 </div>
                 <h2 className="text-2xl font-black tracking-tight">{t.newCreation}</h2>
              </div>
              <button onClick={resetCreation} className="w-12 h-12 flex items-center justify-center bg-stone-50 text-stone-400 hover:text-stone-900 rounded-full transition-all">
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 scrollbar-hide space-y-12">
              {incompatibilityMsg ? (
                 <div className="bg-red-50 p-10 rounded-[2.5rem] text-center space-y-8 animate-in slide-in-from-bottom-4">
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl">
                       <AlertTriangle size={40} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-red-900 mb-4">{t.incompatibleTitle}</h3>
                       <p className="text-red-700 font-medium leading-relaxed mb-2">{t.incompatibleSub}</p>
                       <p className="text-red-800 font-black text-lg italic underline decoration-red-200">"{incompatibilityMsg}"</p>
                    </div>
                    <button onClick={() => setIncompatibilityMsg(null)} className="bg-stone-900 text-white px-10 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl active:scale-95">
                       {t.tryAgain}
                    </button>
                 </div>
              ) : (
                <>
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <Search size={14} className="text-green-500" />
                         <label className="block text-xs font-black text-stone-400 uppercase tracking-[0.4em]">{t.ingredientLabel}</label>
                      </div>
                      <textarea 
                        placeholder={t.ingredientPlaceholder} 
                        className="w-full h-32 p-6 rounded-3xl bg-stone-50 border-4 border-transparent focus:border-green-500 focus:bg-white focus:outline-none transition-all font-bold text-stone-800 text-base resize-none shadow-inner" 
                        value={ingredientsInput} 
                        onChange={(e) => setIngredientsInput(e.target.value)} 
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <Ban size={14} className="text-red-400" />
                         <label className="block text-xs font-black text-stone-400 uppercase tracking-[0.4em]">{t.excludedLabel}</label>
                      </div>
                      <textarea 
                        placeholder={t.excludedPlaceholder} 
                        className="w-full h-24 p-6 rounded-3xl bg-stone-50 border-4 border-transparent focus:border-red-400 focus:bg-white focus:outline-none transition-all font-bold text-stone-800 text-base resize-none shadow-inner" 
                        value={excludedInput} 
                        onChange={(e) => setExcludedInput(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <label className="block text-xs font-black text-stone-400 uppercase tracking-[0.4em]">{t.selectCuisine}</label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.values(CuisineType).map(type => (
                          <button 
                            key={type} 
                            onClick={() => setSelectedCuisine(type)} 
                            className={`p-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${selectedCuisine === type ? 'bg-green-600 border-green-600 text-white shadow-xl shadow-green-100' : 'bg-stone-50 border-stone-50 text-stone-500 hover:border-orange-100 hover:text-orange-500'}`}
                          >
                            {t.cuisines[type]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <label className="block text-xs font-black text-stone-400 uppercase tracking-[0.4em]">{t.selectMethod}</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setSelectedMethod('Any')} className={`p-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${selectedMethod === 'Any' ? 'bg-green-600 border-green-600 text-white shadow-xl shadow-green-100' : 'bg-stone-50 border-stone-50 text-stone-500 hover:border-orange-100 hover:text-orange-500'}`}>{t.any}</button>
                        {Object.values(CookingMethod).map(method => (
                          <button key={method} onClick={() => setSelectedMethod(method)} className={`p-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${selectedMethod === method ? 'bg-green-600 border-green-600 text-white shadow-xl shadow-green-100' : 'bg-stone-50 border-stone-50 text-stone-500 hover:border-orange-100 hover:text-orange-500'}`}>{t.methods[method]}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="block text-xs font-black text-stone-400 uppercase tracking-[0.4em]">{t.selectTime}</label>
                    <div className="flex gap-3">
                      <button onClick={() => setSelectedTime('Any')} className={`flex-1 p-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${selectedTime === 'Any' ? 'bg-green-600 border-green-600 text-white shadow-xl shadow-green-100' : 'bg-stone-50 border-stone-50 text-stone-500 hover:border-orange-100 hover:text-orange-500'}`}>{t.any}</button>
                      {Object.values(CookingTime).map(time => (
                        <button key={time} onClick={() => setSelectedTime(time)} className={`flex-[2] p-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${selectedTime === time ? 'bg-green-600 border-green-600 text-white shadow-xl shadow-green-100' : 'bg-stone-50 border-stone-50 text-stone-500 hover:border-orange-100 hover:text-orange-500'}`}>{t.times[time]}</button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center pt-8 border-t border-stone-100">
                    <div className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${isFineDining ? 'bg-amber-50 border-amber-400 shadow-xl' : 'bg-stone-50 border-stone-50 hover:border-amber-100'}`} onClick={() => setIsFineDining(!isFineDining)}>
                      <div className="flex items-center gap-4">
                        <Trophy size={24} className={isFineDining ? 'text-amber-500' : 'text-stone-300 group-hover:text-amber-300'} />
                        <span className="text-sm font-black text-stone-800 tracking-tight">{t.fineDining}</span>
                      </div>
                      <div className={`w-12 h-7 rounded-full p-1 transition-all ${isFineDining ? 'bg-amber-500' : 'bg-stone-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${isFineDining ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 bg-stone-50 p-6 rounded-[2.5rem] shadow-inner">
                      <Users size={20} className="text-stone-300" />
                      <div className="flex-1 flex items-center justify-between">
                         <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t.portion}:</span>
                         <div className="flex items-center gap-5">
                            <button onClick={() => setServings(Math.max(1, servings - 1))} className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-stone-400 hover:text-green-600 shadow-lg font-black text-xl transition-all active:scale-90">-</button>
                            <span className="font-black text-stone-900 text-xl w-6 text-center">{servings}</span>
                            <button onClick={() => setServings(servings + 1)} className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-stone-400 hover:text-green-600 shadow-lg font-black text-xl transition-all active:scale-90">+</button>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <button 
                      disabled={loading || !ingredientsInput.trim()} 
                      onClick={handleGenerate} 
                      className="w-full bg-stone-900 text-white py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-3xl shadow-green-100 active:scale-[0.98]"
                    >
                      {loading ? <Loader2 className="animate-spin" size={28} /> : <Zap size={28} fill="currentColor" />}
                      {loading ? t.generating : t.generateBtn}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {viewingRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-6xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-full md:h-[90vh] shadow-3xl border-8 border-white">
            <div className="flex-1 overflow-y-auto p-12 lg:p-16 scrollbar-hide">
              <div className="flex items-center gap-3 mb-10 flex-wrap">
                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-widest">{t.cuisines[viewingRecipe.cuisine]}</div>
                {viewingRecipe.method && <div className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-[10px] font-black uppercase tracking-widest">{t.methods[viewingRecipe.method]}</div>}
                {viewingRecipe.isFineDining && <div className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-100"><Sparkles size={10} /> Fine Dining</div>}
                <div className="px-4 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Users size={12} /> {viewingRecipe.servings}P</div>
              </div>
              <h2 className="text-5xl font-black text-stone-900 mb-8 tracking-tight">{viewingRecipe.title}</h2>
              <p className="text-stone-400 mb-16 text-2xl italic font-medium leading-relaxed border-l-8 border-stone-50 pl-8">"{viewingRecipe.description}"</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div>
                  <h3 className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                    <div className="w-2 h-2 bg-stone-200 rounded-full" /> {t.ingredients}
                  </h3>
                  <div className="space-y-4">
                    {viewingRecipe.ingredients.map((ing, i) => (
                      <div key={i} className="flex justify-between border-b border-stone-50 pb-3 text-stone-700 font-bold">
                        <span>{ing.item}</span>
                        <span className="font-black text-green-600">{ing.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                    <div className="w-2 h-2 bg-stone-200 rounded-full" /> {t.steps}
                  </h3>
                  <div className="space-y-12">
                    {viewingRecipe.steps.map((step, i) => (
                      <div key={i} className="flex flex-col sm:flex-row gap-8 items-start group">
                         <div className="flex-shrink-0 relative">
                            <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-stone-50 shadow-md border-4 border-white">
                               {step.imageUrl ? <img src={step.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-200"><Loader2 className="animate-spin" size={16} /></div>}
                            </div>
                            <span className="absolute -top-2 -left-2 w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center text-[10px] font-black border-4 border-white shadow-lg">{i+1}</span>
                         </div>
                         <p className="text-stone-600 leading-relaxed font-semibold pt-2">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[420px] bg-stone-50/50 flex flex-col p-12 backdrop-blur-2xl">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-xl font-black text-stone-900 uppercase tracking-tighter">{t.yourProgress}</h3>
                <button onClick={() => setViewingRecipe(null)} className="w-12 h-12 flex items-center justify-center bg-white text-stone-400 hover:text-stone-900 rounded-full shadow-xl transition-all"><X size={24} /></button>
              </div>
              {!viewingRecipe.userPhoto ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-white rounded-[3rem] shadow-2xl border border-white">
                  <div className="w-24 h-24 bg-stone-50 border-4 border-dashed border-stone-100 rounded-[2.5rem] flex items-center justify-center text-stone-200 mb-8"><Camera size={40} /></div>
                  <h4 className="text-3xl font-black text-stone-900 mb-4">{t.finishedCooking}</h4>
                  <p className="text-stone-400 font-medium mb-12 leading-relaxed">{t.uploadSub}</p>
                  <label className="w-full bg-green-600 text-white py-5 rounded-[2rem] font-black shadow-2xl shadow-green-100 cursor-pointer hover:bg-stone-900 transition-all flex items-center justify-center gap-3 active:scale-95 text-xs uppercase tracking-widest">
                    {uploadingPhoto ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} strokeWidth={3} />}
                    {uploadingPhoto ? t.analyzing : t.uploadResult}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, viewingRecipe.id)} disabled={uploadingPhoto} />
                  </label>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-12 scrollbar-hide">
                  <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white transform rotate-3 hover:rotate-0 transition-transform duration-700"><img src={viewingRecipe.userPhoto} className="w-full h-64 object-cover" /></div>
                  {viewingRecipe.aiReview && (
                    <div className="bg-white p-10 rounded-[3rem] border border-stone-50 shadow-2xl space-y-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-3 bg-green-500 text-white rounded-bl-[2rem] shadow-lg"><Sparkles size={16} /></div>
                      <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-2xl text-sm font-black shadow-sm"><Star size={18} fill="currentColor" />{viewingRecipe.aiReview.score}/10</div>
                      <p className="text-sm text-stone-500 italic font-medium leading-relaxed border-l-8 border-green-50 pl-6">"{viewingRecipe.aiReview.comment}"</p>
                      <div className="space-y-6">
                        <h5 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.3em]">{t.expertTips}</h5>
                        <ul className="space-y-4">
                          {viewingRecipe.aiReview.suggestions.map((s, i) => (
                            <li key={i} className="text-xs text-stone-600 flex gap-4 font-bold bg-stone-50 p-4 rounded-2xl border border-white shadow-sm"><span className="text-green-500 font-black">#</span> {s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  <div className="text-center py-8"><span className="text-[10px] font-black text-green-600 bg-green-50 px-6 py-3 rounded-full border border-green-100 uppercase tracking-widest shadow-xl">{t.completed} {new Date(viewingRecipe.completedAt!).toLocaleDateString()}</span></div>
                </div>
              )}
              <button onClick={(e) => { handleDeleteRecipe(viewingRecipe.id, e as any); }} className="mt-10 text-[10px] font-black text-stone-300 hover:text-red-500 flex items-center justify-center gap-3 transition-colors uppercase tracking-[0.4em]">{t.remove}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
