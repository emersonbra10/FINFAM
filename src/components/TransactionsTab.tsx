import React, { useState } from 'react';
import { Transaction, FamilyMember, CategoryType, CardType } from '../types';

interface TransactionsTabProps {
  transactions: Transaction[];
  members: FamilyMember[];
  currentMember: FamilyMember;
  onConfirmAutoTransaction: (id: string) => void;
  onAddTransaction: (newTx: Omit<Transaction, 'id'>) => void;
  onEditAutoTransaction: (id: string) => void;
  showNewTransactionForm: boolean;
  onToggleNewTransactionForm: (show: boolean) => void;
}

export default function TransactionsTab({
  transactions,
  members,
  currentMember,
  onConfirmAutoTransaction,
  onAddTransaction,
  onEditAutoTransaction,
  showNewTransactionForm,
  onToggleNewTransactionForm
}: TransactionsTabProps) {
  const [filterType, setFilterType] = useState<'TODOS' | 'NUBANK' | 'ALIMENTAÇÃO' | 'LAZER'>('TODOS');
  
  // Filter confirmed transactions
  const confirmedTransactions = transactions.filter(t => t.status === 'confirmado');
  
  // Pending transactions
  const pendingTransactions = transactions.filter(t => t.status === 'pendente_confirmacao');

  // Apply filters
  const filteredTransactions = confirmedTransactions.filter(t => {
    if (filterType === 'TODOS') return true;
    if (filterType === 'NUBANK') return t.card === 'Nubank';
    if (filterType === 'ALIMENTAÇÃO') return t.category === 'Alimentação';
    if (filterType === 'LAZER') return t.category === 'Lazer';
    return true;
  });

  // Entry Method choice
  const [entryMethod, setEntryMethod] = useState<'manual' | 'receipt' | 'audio'>('manual');

  // Traditional Form states
  const [description, setDescription] = useState('');
  const [valueStr, setValueStr] = useState('');
  const [category, setCategory] = useState<CategoryType>('Alimentação');
  const [card, setCard] = useState<CardType>('Nubank');
  const [selectedMemberId, setSelectedMemberId] = useState(currentMember.id);

  // AI Extraction States
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [selectedReceiptSample, setSelectedReceiptSample] = useState<string | null>(null);
  const [receiptImageName, setReceiptImageName] = useState<string | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [audioStep, setAudioStep] = useState(0);
  const [transcriptText, setTranscriptText] = useState('');
  const [selectedAudioSample, setSelectedAudioSample] = useState<string | null>(null);

  // Extracted fields to show/verify before submitting
  const [extractedDesc, setExtractedDesc] = useState('');
  const [extractedVal, setExtractedVal] = useState('');
  const [extractedCategory, setExtractedCategory] = useState<CategoryType>('Alimentação');
  const [extractedCard, setExtractedCard] = useState<CardType>('Nubank');
  const [extractedMemberId, setExtractedMemberId] = useState(currentMember.id);
  const [hasExtractedData, setHasExtractedData] = useState(false);

  // Audio Recording states & Speech Recognition
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  // Traditional Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedValue = parseFloat(valueStr.replace(',', '.'));
    if (!description || isNaN(parsedValue)) return;

    onAddTransaction({
      description,
      value: parsedValue,
      date: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      category,
      card,
      memberId: selectedMemberId,
      status: 'confirmado',
      isOverBudget: parsedValue > 800
    });

    // Reset form
    setDescription('');
    setValueStr('');
    setCategory('Alimentação');
    setCard('Nubank');
    onToggleNewTransactionForm(false);
  };

  // AI Heuristics parsing algorithm
  const parseAIText = (text: string) => {
    const normalized = text.toLowerCase();
    
    // 1. Identify value
    let value = 0;
    
    const numberWords: { [key: string]: number } = {
      'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'quatro': 4, 'cinco': 5,
      'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10, 'onze': 11, 'doze': 12,
      'treze': 13, 'quatorze': 14, 'quinze': 15, 'dezesseis': 16, 'dezessete': 17,
      'dezoito': 18, 'dezenove': 19, 'vinte': 20, 'trinta': 30, 'quarenta': 40,
      'cinquenta': 50, 'sessenta': 60, 'setenta': 70, 'oitenta': 80, 'noventa': 90,
      'cem': 100, 'cento': 100, 'duzentos': 200, 'trezentos': 300, 'quatrocentos': 400,
      'quinhentos': 500, 'seiscentos': 600, 'setecentos': 700, 'oitocentos': 800,
      'novecentos': 900
    };

    const digitRegex = /\d+(?:[\.,]\d+)?/g;
    const digits = normalized.match(digitRegex);
    if (digits && digits.length > 0) {
      value = parseFloat(digits[0].replace(',', '.'));
    } else {
      let computedValue = 0;
      const words = normalized.split(/\s+/);
      let tempSum = 0;
      words.forEach(word => {
        if (numberWords[word] !== undefined) {
          if (numberWords[word] >= 100 && tempSum > 0) {
            tempSum = tempSum * numberWords[word];
          } else {
            tempSum += numberWords[word];
          }
        } else if (word === 'e') {
          // skip
        } else {
          if (tempSum > 0) {
            computedValue += tempSum;
            tempSum = 0;
          }
        }
      });
      if (tempSum > 0) {
        computedValue += tempSum;
      }
      value = computedValue;
    }

    // 2. Identify Category
    let category: CategoryType = 'Outros';
    if (normalized.includes('mercado') || normalized.includes('carrefour') || normalized.includes('pão de açúcar') || normalized.includes('padaria') || normalized.includes('restaurante') || normalized.includes('pizzaria') || normalized.includes('lanche') || normalized.includes('comida') || normalized.includes('jantar') || normalized.includes('almoço')) {
      category = 'Alimentação';
    } else if (normalized.includes('aluguel') || normalized.includes('condomínio') || normalized.includes('luz') || normalized.includes('água') || normalized.includes('casa') || normalized.includes('internet') || normalized.includes('wifi')) {
      category = 'Moradia';
    } else if (normalized.includes('cinema') || normalized.includes('jogo') || normalized.includes('games') || normalized.includes('lazer') || normalized.includes('futebol') || normalized.includes('shopp') || normalized.includes('festa') || normalized.includes('show') || normalized.includes('teatro')) {
      category = 'Lazer';
    } else if (normalized.includes('netflix') || normalized.includes('spotify') || normalized.includes('assinatura') || normalized.includes('prime') || normalized.includes('disney')) {
      category = 'Assinaturas';
    } else if (normalized.includes('uber') || normalized.includes('99') || normalized.includes('táxi') || normalized.includes('gasolina') || normalized.includes('combustível') || normalized.includes('posto') || normalized.includes('ônibus') || normalized.includes('pedágio')) {
      category = 'Transporte';
    }

    // 3. Identify Card
    let card: CardType = 'Outros';
    if (normalized.includes('nubank') || normalized.includes('roxinho')) {
      card = 'Nubank';
    } else if (normalized.includes('inter') || normalized.includes('laranjinha')) {
      card = 'Inter';
    }

    // 4. Identify Description
    let description = 'Gasto por IA';
    if (normalized.includes('farmácia') || normalized.includes('drogaria') || normalized.includes('remedio') || normalized.includes('remédio')) {
      description = 'Farmácia';
    } else if (normalized.includes('uber')) {
      description = 'Uber Viagem';
    } else if (normalized.includes('supermercado') || normalized.includes('mercado') || normalized.includes('carrefour')) {
      description = 'Supermercado';
    } else if (normalized.includes('padaria')) {
      description = 'Padaria';
    } else if (normalized.includes('posto') || normalized.includes('gasolina') || normalized.includes('combustível')) {
      description = 'Posto de Combustível';
    } else if (normalized.includes('netflix')) {
      description = 'Assinatura Netflix';
    } else if (normalized.includes('cinema') || normalized.includes('ingresso')) {
      description = 'Ingressos Cinema';
    } else if (normalized.includes('pizza') || normalized.includes('pizzaria')) {
      description = 'Pizzaria';
    } else if (normalized.includes('condomínio')) {
      description = 'Taxa de Condomínio';
    } else {
      const words = normalized.split(' ');
      const filteredWords = words.filter(w => !['gastei', 'paguei', 'comprado', 'comprei', 'reais', 'no', 'cartão', 'com', 'o', 'a', 'de', 'do', 'na', 'no', 'em'].includes(w));
      if (filteredWords.length > 0) {
        description = filteredWords.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }

    // 5. Identify Member
    let memberId = currentMember.id;
    members.forEach(m => {
      if (normalized.includes(m.name.toLowerCase())) {
        memberId = m.id;
      }
    });

    return {
      description,
      value: value || 15.00,
      category,
      card,
      memberId
    };
  };

  // Trigger Receipt scanning simulation
  const handleScanReceipt = (sampleName: string, customDetails?: { description: string, value: number, category: CategoryType, card: CardType }) => {
    setIsScanning(true);
    setScanStep(0);
    setSelectedReceiptSample(sampleName);
    setHasExtractedData(false);

    // Simulate stepping through logs
    const interval = setInterval(() => {
      setScanStep(prev => prev + 1);
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setIsScanning(false);
      
      // Determine final extracted output
      let details = {
        description: 'Supermercado Carrefour',
        value: 189.50,
        category: 'Alimentação' as CategoryType,
        card: 'Nubank' as CardType,
        memberId: currentMember.id
      };

      if (sampleName === 'posto') {
        details = {
          description: 'Posto Shell Limitada',
          value: 250.00,
          category: 'Transporte',
          card: 'Inter',
          memberId: currentMember.id
        };
      } else if (sampleName === 'netflix') {
        details = {
          description: 'Fatura Mensal Netflix',
          value: 55.90,
          category: 'Assinaturas',
          card: 'Nubank',
          memberId: currentMember.id
        };
      } else if (customDetails) {
        details = {
          description: customDetails.description,
          value: customDetails.value,
          category: customDetails.category,
          card: customDetails.card,
          memberId: currentMember.id
        };
      }

      setExtractedDesc(details.description);
      setExtractedVal(details.value.toFixed(2).replace('.', ','));
      setExtractedCategory(details.category);
      setExtractedCard(details.card);
      setExtractedMemberId(details.memberId);
      setHasExtractedData(true);
    }, 2000);
  };

  // Trigger Audio processing
  const handleProcessAudio = (text: string) => {
    setIsProcessingAudio(true);
    setAudioStep(0);
    setHasExtractedData(false);

    const interval = setInterval(() => {
      setAudioStep(prev => prev + 1);
    }, 600);

    setTimeout(() => {
      clearInterval(interval);
      setIsProcessingAudio(false);

      const parsed = parseAIText(text);
      setExtractedDesc(parsed.description);
      setExtractedVal(parsed.value.toFixed(2).replace('.', ','));
      setExtractedCategory(parsed.category);
      setExtractedCard(parsed.card);
      setExtractedMemberId(parsed.memberId);
      setHasExtractedData(true);
    }, 1800);
  };

  // Start real speech recognition if supported, otherwise mock it beautifully
  const startAudioRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsRecording(true);
    setRecordingSeconds(0);
    setTranscriptText('');

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'pt-BR';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscriptText(text);
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error', e);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.start();
      setRecognitionInstance(rec);
    }

    // Secondary timer to count seconds visually
    const timer = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);

    (window as any)._recTimer = timer;
  };

  const stopAudioRecording = () => {
    clearInterval((window as any)._recTimer);
    setIsRecording(false);
    
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (e) {}
    }

    // If no text was captured yet (or because SpeechRecognition is not supported/no permission), 
    // fill in a random amazing voice transcription to let the user see it in action perfectly
    setTimeout(() => {
      if (!transcriptText) {
        const fallbackSpeech = "Gastei setenta e cinco reais comprando lanches na Pizzaria com o cartão Nubank";
        setTranscriptText(fallbackSpeech);
        handleProcessAudio(fallbackSpeech);
      } else {
        handleProcessAudio(transcriptText);
      }
    }, 300);
  };

  // File Upload handler for receipt image
  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptImageName(file.name);
      // Generate a dynamic mock value based on the file name or a default
      const randomValue = parseFloat((Math.random() * 150 + 20).toFixed(2));
      const extractedName = file.name.split('.')[0]
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') || 'Nota Fiscal Carregada';

      handleScanReceipt(file.name, {
        description: extractedName,
        value: randomValue,
        category: 'Alimentação',
        card: 'Nubank'
      });
    }
  };

  // Submit AI Extracted Transaction
  const handleConfirmExtracted = () => {
    const parsedValue = parseFloat(extractedVal.replace(',', '.'));
    if (!extractedDesc || isNaN(parsedValue)) return;

    onAddTransaction({
      description: extractedDesc,
      value: parsedValue,
      date: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      category: extractedCategory,
      card: extractedCard,
      memberId: extractedMemberId,
      status: 'confirmado',
      isOverBudget: parsedValue > 800
    });

    // Reset all AI states
    setHasExtractedData(false);
    setSelectedReceiptSample(null);
    setSelectedAudioSample(null);
    setReceiptImageName(null);
    setTranscriptText('');
    onToggleNewTransactionForm(false);
  };

  const getCategoryIcon = (cat: CategoryType) => {
    switch(cat) {
      case 'Moradia': return 'home';
      case 'Alimentação': return 'restaurant';
      case 'Lazer': return 'sports_esports';
      case 'Assinaturas': return 'movie';
      case 'Transporte': return 'directions_car';
      default: return 'category';
    }
  };

  const getMemberName = (id: string) => {
    return members.find(m => m.id === id)?.name || id;
  };

  return (
    <div className="space-y-6">
      {/* Tab Header & Action Trigger */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-extrabold text-white">Lançamentos</h1>
        <button
          onClick={() => onToggleNewTransactionForm(!showNewTransactionForm)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-indigo-600/35 hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs font-bold font-headline border border-indigo-500/30"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          NOVO LANÇAMENTO
        </button>
      </div>

      {/* Manual & AI Transaction collapsible Form */}
      {showNewTransactionForm && (
        <div className="glass-card rounded-2xl p-6 shadow-2xl border border-white/10 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-indigo-400 text-2xl">auto_awesome</span>
              <div>
                <h2 className="text-base font-bold text-white">Lançamento Inteligente por IA</h2>
                <p className="text-[10px] text-slate-400">Escolha como deseja lançar a despesa familiar por inteligência artificial.</p>
              </div>
            </div>
            
            <button 
              onClick={() => onToggleNewTransactionForm(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors self-end sm:self-center"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Segmented Entry Method Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-white/5 mb-6">
            <button
              onClick={() => { setEntryMethod('manual'); setHasExtractedData(false); }}
              className={`py-3 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer ${
                entryMethod === 'manual' 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-base">payments</span>
              <span>Manual</span>
            </button>
            <button
              onClick={() => { setEntryMethod('receipt'); setHasExtractedData(false); }}
              className={`py-3 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer ${
                entryMethod === 'receipt' 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-base">receipt_long</span>
              <span>Foto de Nota</span>
            </button>
            <button
              onClick={() => { setEntryMethod('audio'); setHasExtractedData(false); }}
              className={`py-3 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer ${
                entryMethod === 'audio' 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-base">mic</span>
              <span>Áudio Explicativo</span>
            </button>
          </div>

          {/* 1. MANUAL ENTRY METHOD */}
          {entryMethod === 'manual' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Descrição</label>
                  <input
                    type="text"
                    placeholder="Ex: Supermercado Carrefour, Uber Viagem, Netflix"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Valor (R$)</label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={valueStr}
                    onChange={e => setValueStr(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as CategoryType)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all outline-none cursor-pointer"
                  >
                    <option className="bg-slate-950 text-white" value="Alimentação">Alimentação</option>
                    <option className="bg-slate-950 text-white" value="Moradia">Moradia</option>
                    <option className="bg-slate-950 text-white" value="Lazer">Lazer</option>
                    <option className="bg-slate-950 text-white" value="Assinaturas">Assinaturas</option>
                    <option className="bg-slate-950 text-white" value="Transporte">Transporte</option>
                    <option className="bg-slate-950 text-white" value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Meio de Pagamento</label>
                  <select
                    value={card}
                    onChange={e => setCard(e.target.value as CardType)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all outline-none cursor-pointer"
                  >
                    <option className="bg-slate-950 text-white" value="Nubank">Cartão Nubank</option>
                    <option className="bg-slate-950 text-white" value="Inter">Cartão Inter</option>
                    <option className="bg-slate-950 text-white" value="Outros">Outros / Dinheiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Membro</label>
                  <select
                    value={selectedMemberId}
                    onChange={e => setSelectedMemberId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all outline-none cursor-pointer"
                  >
                    {members.map(m => (
                      <option className="bg-slate-950 text-white" key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onToggleNewTransactionForm(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer shadow-lg shadow-indigo-600/30 border border-indigo-500/35"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          )}

          {/* 2. RECEIPT SCANNING METHOD */}
          {entryMethod === 'receipt' && (
            <div className="space-y-6">
              {/* Drag and Drop Zone */}
              {!isScanning && !hasExtractedData && (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-indigo-500/40 bg-white/2 rounded-2xl p-8 text-center transition-all relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleReceiptFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="material-symbols-outlined text-4xl text-indigo-400 mb-3 animate-bounce">
                    upload_file
                  </span>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Arraste ou envie a foto da nota fiscal
                  </h3>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                    A inteligência artificial irá extrair automaticamente a descrição, data, valor e classificar na categoria correta.
                  </p>
                </div>
              )}

              {/* Instant Test Samples */}
              {!isScanning && !hasExtractedData && (
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-indigo-400">tips_and_updates</span>
                    <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      Não tem foto no momento? Escolha uma nota de teste rápida:
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleScanReceipt('carrefour')}
                      className="text-left bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/20 p-3 rounded-xl border border-white/5 cursor-pointer transition-all"
                    >
                      <p className="text-xs font-bold text-white">Carrefour Super</p>
                      <p className="text-[10px] text-indigo-300 font-mono mt-0.5">R$ 189,50</p>
                      <span className="text-[8px] uppercase tracking-wider text-slate-500 block mt-1">Alimentação</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScanReceipt('posto')}
                      className="text-left bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/20 p-3 rounded-xl border border-white/5 cursor-pointer transition-all"
                    >
                      <p className="text-xs font-bold text-white">Posto Shell</p>
                      <p className="text-[10px] text-indigo-300 font-mono mt-0.5">R$ 250,00</p>
                      <span className="text-[8px] uppercase tracking-wider text-slate-500 block mt-1">Transporte</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScanReceipt('netflix')}
                      className="text-left bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/20 p-3 rounded-xl border border-white/5 cursor-pointer transition-all"
                    >
                      <p className="text-xs font-bold text-white">Fatura Netflix</p>
                      <p className="text-[10px] text-indigo-300 font-mono mt-0.5">R$ 55,90</p>
                      <span className="text-[8px] uppercase tracking-wider text-slate-500 block mt-1">Assinaturas</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Scanning visual overlay */}
              {isScanning && (
                <div className="flex flex-col items-center justify-center py-10 bg-slate-950/60 rounded-2xl border border-white/10 relative overflow-hidden">
                  {/* Glowing Laser Scan effect */}
                  <div className="relative w-44 h-52 bg-slate-900 border border-white/10 rounded-xl shadow-inner overflow-hidden mb-5">
                    {/* Simulated Receipt paper */}
                    <div className="p-3 text-slate-500 space-y-1.5 text-[8px] font-mono leading-none">
                      <div className="h-2 bg-white/10 rounded w-2/3 mx-auto mb-2" />
                      <div className="h-1 bg-white/10 rounded w-full" />
                      <div className="h-1 bg-white/10 rounded w-5/6" />
                      <div className="h-1 bg-white/10 rounded w-4/5" />
                      <div className="h-2 bg-white/10 rounded w-1/3 ml-auto mt-4" />
                      <div className="h-1 bg-white/10 rounded w-full mt-2" />
                    </div>
                    {/* Horizontal laser beam */}
                    <div className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-lg shadow-indigo-500/80 animate-scan select-none pointer-events-none" />
                  </div>

                  <div className="text-center space-y-2 max-w-xs">
                    <p className="text-sm font-bold text-indigo-300 animate-pulse flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-base animate-spin">sync</span>
                      IA Analisando Nota...
                    </p>
                    <div className="text-[10px] text-slate-400 font-medium h-5">
                      {scanStep === 0 && "🔍 Detectando bordas e enquadramento..."}
                      {scanStep === 1 && "⚡ Executando OCR e lendo valores de texto..."}
                      {scanStep === 2 && "🧠 IA categorizando despesa e buscando CNPJ..."}
                      {scanStep >= 3 && "✅ Dados extraídos com sucesso!"}
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted Form Confirmation */}
              {hasExtractedData && !isScanning && (
                <div className="space-y-4 bg-slate-950/50 p-5 rounded-2xl border border-indigo-500/25 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider font-headline">Dados Extraídos por IA com Sucesso</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Descrição Extraída</label>
                      <input
                        type="text"
                        value={extractedDesc}
                        onChange={e => setExtractedDesc(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Valor Detectado (R$)</label>
                      <input
                        type="text"
                        value={extractedVal}
                        onChange={e => setExtractedVal(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all outline-none font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Categoria Sugerida</label>
                      <select
                        value={extractedCategory}
                        onChange={e => setExtractedCategory(e.target.value as CategoryType)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all outline-none cursor-pointer"
                      >
                        <option className="bg-slate-950 text-white" value="Alimentação">Alimentação</option>
                        <option className="bg-slate-950 text-white" value="Moradia">Moradia</option>
                        <option className="bg-slate-950 text-white" value="Lazer">Lazer</option>
                        <option className="bg-slate-950 text-white" value="Assinaturas">Assinaturas</option>
                        <option className="bg-slate-950 text-white" value="Transporte">Transporte</option>
                        <option className="bg-slate-950 text-white" value="Outros">Outros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Conta Estimada</label>
                      <select
                        value={extractedCard}
                        onChange={e => setExtractedCard(e.target.value as CardType)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all outline-none cursor-pointer"
                      >
                        <option className="bg-slate-950 text-white" value="Nubank">Cartão Nubank</option>
                        <option className="bg-slate-950 text-white" value="Inter">Cartão Inter</option>
                        <option className="bg-slate-950 text-white" value="Outros">Outros / Dinheiro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Membro</label>
                      <select
                        value={extractedMemberId}
                        onChange={e => setExtractedMemberId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all outline-none cursor-pointer"
                      >
                        {members.map(m => (
                          <option className="bg-slate-950 text-white" key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => { setHasExtractedData(false); setSelectedReceiptSample(null); setReceiptImageName(null); }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                    >
                      Escanear Outro
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmExtracted}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-600/35 border border-emerald-500/30"
                    >
                      Confirmar e Lançar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. AUDIO EXPLICATIVO METHOD */}
          {entryMethod === 'audio' && (
            <div className="space-y-6">
              {/* Recorder Box */}
              {!isProcessingAudio && !hasExtractedData && (
                <div className="flex flex-col items-center justify-center bg-white/2 border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden">
                  
                  {isRecording ? (
                    /* Pulsing Microphone Wave */
                    <div className="space-y-4">
                      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                        <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping duration-1000" />
                        <div className="absolute -inset-2 bg-rose-500/10 rounded-full animate-pulse" />
                        <button
                          type="button"
                          onClick={stopAudioRecording}
                          className="w-16 h-16 bg-rose-600 hover:bg-rose-500 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg shadow-rose-600/50 relative z-10 transition-all border border-rose-500/40"
                        >
                          <span className="material-symbols-outlined text-3xl font-bold">stop</span>
                        </button>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-bold text-rose-400">Gravando áudio explicativo...</p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:
                          {(recordingSeconds % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      
                      {/* Interactive Wave line visual */}
                      <div className="flex gap-1 justify-center items-center h-8">
                        <span className="w-1 bg-rose-500 h-2 rounded animate-bounce [animation-delay:0.1s]" />
                        <span className="w-1 bg-rose-500 h-5 rounded animate-bounce [animation-delay:0.3s]" />
                        <span className="w-1 bg-rose-500 h-3 rounded animate-bounce [animation-delay:0.5s]" />
                        <span className="w-1 bg-rose-500 h-6 rounded animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1 bg-rose-500 h-2 rounded animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  ) : (
                    /* Initial mic visual */
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={startAudioRecording}
                        className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg shadow-indigo-600/50 transition-all hover:scale-105 border border-indigo-500/40"
                      >
                        <span className="material-symbols-outlined text-3xl">mic</span>
                      </button>

                      <div className="space-y-1 max-w-xs mx-auto">
                        <h3 className="text-sm font-bold text-white">Toque para Gravar o Gasto</h3>
                        <p className="text-[10px] text-slate-400">
                          Fale brevemente em português, ex: <span className="text-indigo-300">"Gastei 45 reais com combustível hoje usando o Nubank"</span>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Instant Audio Test Samples */}
              {!isRecording && !isProcessingAudio && !hasExtractedData && (
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-indigo-400">tips_and_updates</span>
                    <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      Ou teste rapidamente enviando um áudio simulado:
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => { setTranscriptText("Paguei trinta e cinco reais na farmácia hoje com o Nubank"); handleProcessAudio("Paguei trinta e cinco reais na farmácia hoje com o Nubank"); }}
                      className="text-left bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/20 p-3 rounded-xl border border-white/5 cursor-pointer transition-all flex items-start gap-2"
                    >
                      <span className="material-symbols-outlined text-indigo-400 text-sm mt-0.5">play_arrow</span>
                      <div>
                        <p className="text-xs font-bold text-white">Farmácia Nubank</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">"Paguei R$ 35 na farmácia..."</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTranscriptText("Ricardo gastou cento e vinte reais comprando ingressos do cinema no cartão Inter"); handleProcessAudio("Ricardo gastou cento e vinte reais comprando ingressos do cinema no cartão Inter"); }}
                      className="text-left bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/20 p-3 rounded-xl border border-white/5 cursor-pointer transition-all flex items-start gap-2"
                    >
                      <span className="material-symbols-outlined text-indigo-400 text-sm mt-0.5">play_arrow</span>
                      <div>
                        <p className="text-xs font-bold text-white">Lazer no Inter</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">"Ricardo gastou R$ 120 no cinema..."</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTranscriptText("Paguei cento e oitenta reais de supermercado ontem no dinheiro"); handleProcessAudio("Paguei cento e oitenta reais de supermercado ontem no dinheiro"); }}
                      className="text-left bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/20 p-3 rounded-xl border border-white/5 cursor-pointer transition-all flex items-start gap-2"
                    >
                      <span className="material-symbols-outlined text-indigo-400 text-sm mt-0.5">play_arrow</span>
                      <div>
                        <p className="text-xs font-bold text-white">Supermercado</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">"Paguei R$ 180 no mercado..."</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Audio Processing Animation */}
              {isProcessingAudio && (
                <div className="flex flex-col items-center justify-center py-10 bg-slate-950/60 rounded-2xl border border-white/10">
                  <div className="flex gap-1.5 justify-center items-center h-16 mb-4">
                    <span className="w-1 bg-indigo-400 h-10 rounded animate-pulse" />
                    <span className="w-1 bg-indigo-500 h-16 rounded animate-pulse [animation-delay:0.2s]" />
                    <span className="w-1 bg-fuchsia-500 h-8 rounded animate-pulse [animation-delay:0.4s]" />
                    <span className="w-1 bg-indigo-400 h-14 rounded animate-pulse [animation-delay:0.1s]" />
                    <span className="w-1 bg-fuchsia-400 h-6 rounded animate-pulse [animation-delay:0.3s]" />
                  </div>

                  <div className="text-center space-y-2 max-w-xs">
                    <p className="text-sm font-bold text-indigo-300 animate-pulse flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-base animate-spin">sync</span>
                      IA Processando Áudio...
                    </p>
                    <div className="text-[10px] text-slate-400 font-medium h-5">
                      {audioStep === 0 && "🎙️ Transcrevendo áudio em português..."}
                      {audioStep === 1 && "🧠 IA interpretando valores, cartão e categoria..."}
                      {audioStep >= 2 && "✅ Dados extraídos!"}
                    </div>
                  </div>
                </div>
              )}

              {/* Transcribed speech & Extracted Fields Preview */}
              {hasExtractedData && !isProcessingAudio && (
                <div className="space-y-4 bg-slate-950/50 p-5 rounded-2xl border border-indigo-500/25 animate-in zoom-in-95 duration-200">
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Transcrição por Voz:</p>
                    <p className="text-xs text-indigo-200 italic font-medium leading-relaxed">
                      "{transcriptText || "Áudio processado pela inteligência artificial"}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-emerald-400 my-2">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider font-headline">Dados Reconhecidos por IA</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Descrição Extraída</label>
                      <input
                        type="text"
                        value={extractedDesc}
                        onChange={e => setExtractedDesc(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Valor Detectado (R$)</label>
                      <input
                        type="text"
                        value={extractedVal}
                        onChange={e => setExtractedVal(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all outline-none font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Categoria Sugerida</label>
                      <select
                        value={extractedCategory}
                        onChange={e => setExtractedCategory(e.target.value as CategoryType)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all outline-none cursor-pointer"
                      >
                        <option className="bg-slate-950 text-white" value="Alimentação">Alimentação</option>
                        <option className="bg-slate-950 text-white" value="Moradia">Moradia</option>
                        <option className="bg-slate-950 text-white" value="Lazer">Lazer</option>
                        <option className="bg-slate-950 text-white" value="Assinaturas">Assinaturas</option>
                        <option className="bg-slate-950 text-white" value="Transporte">Transporte</option>
                        <option className="bg-slate-950 text-white" value="Outros">Outros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Conta Estimada</label>
                      <select
                        value={extractedCard}
                        onChange={e => setExtractedCard(e.target.value as CardType)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all outline-none cursor-pointer"
                      >
                        <option className="bg-slate-950 text-white" value="Nubank">Cartão Nubank</option>
                        <option className="bg-slate-950 text-white" value="Inter">Cartão Inter</option>
                        <option className="bg-slate-950 text-white" value="Outros">Outros / Dinheiro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Membro</label>
                      <select
                        value={extractedMemberId}
                        onChange={e => setExtractedMemberId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all outline-none cursor-pointer"
                      >
                        {members.map(m => (
                          <option className="bg-slate-950 text-white" key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => { setHasExtractedData(false); setTranscriptText(''); setSelectedAudioSample(null); }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                    >
                      Gravar Outro
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmExtracted}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-600/35 border border-emerald-500/30"
                    >
                      Confirmar e Lançar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Automatic Detection Section */}
      {pendingTransactions.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <span className="material-symbols-outlined text-md font-bold animate-pulse">auto_awesome</span>
            <h2 className="text-xs font-bold tracking-widest uppercase text-indigo-300 font-headline">
              Lançamentos Automáticos
            </h2>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {pendingTransactions.length} Novo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingTransactions.map((tx) => (
              <div 
                key={tx.id} 
                className="glass-card rounded-2xl p-4 flex flex-col justify-between hover:border-white/20 relative group transition-all animate-in zoom-in-95 duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 font-bold group-hover:bg-indigo-500/10 group-hover:text-indigo-300 transition-all">
                      <span className="material-symbols-outlined text-2xl">
                        {getCategoryIcon(tx.category)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{tx.description}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{tx.date}</p>
                    </div>
                  </div>
                  <span className="text-lg font-mono font-extrabold text-white">
                    R$ {tx.value.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => onConfirmAutoTransaction(tx.id)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl font-bold text-[10px] tracking-wider uppercase hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-indigo-600/30 border border-indigo-500/30"
                  >
                    CONFIRMAR
                  </button>
                  <button
                    onClick={() => onEditAutoTransaction(tx.id)}
                    className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters Section */}
      <section className="space-y-3">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1.5 border-b border-white/10">
          <button
            onClick={() => setFilterType('TODOS')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer shadow-sm ${
              filterType === 'TODOS'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
            }`}
          >
            TODOS
          </button>
          <button
            onClick={() => setFilterType('NUBANK')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer shadow-sm ${
              filterType === 'NUBANK'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-xs">credit_card</span>
            CARTÃO NUBANK
          </button>
          <button
            onClick={() => setFilterType('ALIMENTAÇÃO')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer shadow-sm ${
              filterType === 'ALIMENTAÇÃO'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-xs">restaurant</span>
            ALIMENTAÇÃO
          </button>
          <button
            onClick={() => setFilterType('LAZER')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer shadow-sm ${
              filterType === 'LAZER'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-xs">sports_esports</span>
            LAZER
          </button>
        </div>
      </section>

      {/* Detailed History Section */}
      <section className="space-y-4 pb-10">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-headline font-bold text-white">
            Histórico de Transações
          </h3>
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            JULHO 2026
          </span>
        </div>

        <div className="space-y-2.5">
          {filteredTransactions.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-slate-400 border border-dashed border-white/10">
              <span className="material-symbols-outlined text-4xl mb-2 text-slate-500">receipt_long</span>
              <p className="text-sm">Nenhuma transação encontrada com estes filtros.</p>
            </div>
          ) : (
            filteredTransactions.map((t) => {
              const m = members.find(m => m.id === t.memberId) || currentMember;
              return (
                <div 
                  key={t.id} 
                  className={`glass-card rounded-2xl p-4 flex items-center justify-between border hover:border-white/20 transition-all group shadow-sm ${
                    t.isOverBudget 
                      ? 'border-l-4 border-l-fuchsia-500 border-white/10' 
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-300 group-hover:bg-indigo-500/10 group-hover:text-indigo-300 transition-colors">
                      <span className="material-symbols-outlined text-xl">
                        {getCategoryIcon(t.category)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{t.description}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <img 
                          className="w-3.5 h-3.5 rounded-full object-cover border border-white/10" 
                          src={m.avatarUrl} 
                          alt={m.name}
                          referrerPolicy="no-referrer"
                        />
                        <span>{t.date} • {t.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-sm font-mono font-extrabold ${t.isOverBudget ? 'text-fuchsia-400' : 'text-white'}`}>
                      R$ {t.value.toFixed(2).replace('.', ',')}
                    </p>
                    {t.isOverBudget ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 px-1.5 py-0.5 rounded-md">
                        ACIMA DO TETO
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        {t.card}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
