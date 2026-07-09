import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Phone,
  MapPin,
  Calendar,
  Search,
  Plus,
  Trash2,
  Edit,
  X,
  Tag,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  PlusCircle,
  Clock,
  Database,
  Hash,
  Type,
  CalendarDays,
  Info,
  Check,
  ChevronRight,
  User,
  Settings,
  Sliders,
  Sparkles,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

// --- Types ---
export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date';
}

export interface Person {
  id: string;
  name: string;
  phone: string;
  address: string;
  ageGroup: '20대' | '30대' | '40대' | '50대' | '60대' | '기타';
  birthYear: number;
  tags: string[];
  customFields: Record<string, string>; // fieldId -> string value
  createdAt: string;
}

// --- Constants & Initial Data ---
const CURRENT_YEAR = 2026;

const DEFAULT_TAGS = [
  '싸가지 없음',
  '꼬투리 잡음',
  '이해못함',
  '노래하듯 말함',
  '리액션 부자',
  '말이 많음',
  '말귀 못 알아먹음',
  '반말 사용',
  '목소리 큼',
  '막무가내 우기기',
  '갑질 심함',
  '시간 안 지킴',
  '사사건건 시비'
];

const INITIAL_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  { id: 'field_last_contact', name: '마지막 연락일', type: 'date' }
];

const INITIAL_PEOPLE: Person[] = [
  {
    id: 'person_1',
    name: '김도현',
    phone: '010-2345-6789',
    address: '서울시 마포구 독막로 42',
    ageGroup: '30대',
    birthYear: 1991,
    tags: ['꼬투리 잡음', '노래하듯 말함', '말이 많음'],
    customFields: {
      'field_last_contact': '2026-06-15'
    },
    createdAt: '2026-07-01T10:00:00.000Z'
  },
  {
    id: 'person_2',
    name: '박사랑',
    phone: '010-8765-4321',
    address: '부산시 해운대구 우동 100',
    ageGroup: '20대',
    birthYear: 1998,
    tags: ['이해못함', '리액션 부자', '목소리 큼'],
    customFields: {
      'field_last_contact': '2026-07-01'
    },
    createdAt: '2026-07-02T14:30:00.000Z'
  },
  {
    id: 'person_3',
    name: '최영호',
    phone: '010-5555-1234',
    address: '경기도 성남시 분당구 정자동 15',
    ageGroup: '50대',
    birthYear: 1972,
    tags: ['싸가지 없음', '막무가내 우기기'],
    customFields: {
      'field_last_contact': '2026-05-10'
    },
    createdAt: '2026-07-03T09:15:00.000Z'
  },
  {
    id: 'person_4',
    name: '한소희',
    phone: '010-6666-9999',
    address: '서울시 마포구 연남동 3-2',
    ageGroup: '30대',
    birthYear: 1992,
    tags: ['싸가지 없음', '갑질 심함', '리액션 부자'],
    customFields: {
      'field_last_contact': '2026-07-05'
    },
    createdAt: '2026-07-04T16:20:00.000Z'
  }
];

// Helper to assign colors that exactly match high density design specs or have bright distinctions
export function getTagBadgeStyle(tagName: string): string {
  switch (tagName) {
    case '싸가지 없음':
    case '갑질 심함':
    case '사사건건 시비':
      return 'bg-[#fee2e2] text-[#991b1b] border-red-100';
    case '꼬투리 잡음':
    case '막무가내 우기기':
      return 'bg-[#fef3c7] text-[#92400e] border-amber-100';
    case '이해못함':
    case '말귀 못 알아먹음':
      return 'bg-[#dcfce7] text-[#166534] border-emerald-100';
    case '노래하듯 말함':
      return 'bg-[#e0e7ff] text-[#3730a3] border-indigo-100';
    case '리액션 부자':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case '말이 많음':
    case '목소리 큼':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case '시간 안 지킴':
      return 'bg-stone-100 text-stone-800 border-stone-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export default function App() {
  // --- States with LocalStorage Hydration ---
  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem('people_data_v2');
    if (saved) {
      return JSON.parse(saved);
    }
    const oldSaved = localStorage.getItem('people_data');
    if (oldSaved) {
      try {
        const parsed = JSON.parse(oldSaved) as Person[];
        const migrated = parsed.map(p => ({
          ...p,
          tags: p.tags.map(t => {
            if (t === '칼답장') return '목소리 큼';
            if (t === '허풍쟁이') return '막무가내 우기기';
            if (t === '정 많은 편') return '갑질 심함';
            if (t === '유머러스함') return '사사건건 시비';
            return t;
          })
        }));
        localStorage.setItem('people_data_v2', JSON.stringify(migrated));
        localStorage.removeItem('people_data');
        return migrated;
      } catch (e) {
        return INITIAL_PEOPLE;
      }
    }
    return INITIAL_PEOPLE;
  });

  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(() => {
    const saved = localStorage.getItem('custom_fields_data_v2');
    if (saved) return JSON.parse(saved);

    const oldSaved = localStorage.getItem('custom_fields_data');
    if (oldSaved) {
      try {
        const parsed = JSON.parse(oldSaved) as CustomFieldDefinition[];
        const filtered = parsed.filter(cf => cf.id !== 'field_mbti' && cf.id !== 'field_first_score');
        localStorage.setItem('custom_fields_data_v2', JSON.stringify(filtered));
        localStorage.removeItem('custom_fields_data');
        return filtered;
      } catch (e) {
        return INITIAL_CUSTOM_FIELDS;
      }
    }
    return INITIAL_CUSTOM_FIELDS;
  });

  const [tagsPool, setTagsPool] = useState<string[]>(() => {
    const saved = localStorage.getItem('tags_pool_data_v2');
    if (saved) return JSON.parse(saved);
    
    const oldSaved = localStorage.getItem('tags_pool_data');
    if (oldSaved) {
      try {
        const parsed = JSON.parse(oldSaved) as string[];
        const removed = ['칼답장', '허풍쟁이', '정 많은 편', '유머러스함'];
        const added = ['목소리 큼', '막무가내 우기기', '갑질 심함', '시간 안 지킴', '사사건건 시비'];
        const filtered = parsed.filter(t => !removed.includes(t));
        const combined = Array.from(new Set([...filtered, ...added]));
        localStorage.setItem('tags_pool_data_v2', JSON.stringify(combined));
        localStorage.removeItem('tags_pool_data');
        return combined;
      } catch (e) {
        return DEFAULT_TAGS;
      }
    }
    return DEFAULT_TAGS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('people_data_v2', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem('custom_fields_data_v2', JSON.stringify(customFields));
  }, [customFields]);

  useEffect(() => {
    localStorage.setItem('tags_pool_data_v2', JSON.stringify(tagsPool));
  }, [tagsPool]);

  // --- Filtering & Search States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagMatchMode, setTagMatchMode] = useState<'AND' | 'OR'>('OR');
  const [minBirthYear, setMinBirthYear] = useState<string>('');
  const [maxBirthYear, setMaxBirthYear] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'birthYear' | 'createdAt' | 'lastContact'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // --- Interactive/Modal/Pane States ---
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(INITIAL_PEOPLE[0]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  // --- Dynamic New Custom Field Creator State ---
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date'>('text');
  const [isFieldManagerOpen, setIsFieldManagerOpen] = useState(false);

  // --- Form Input States (for Add/Edit Modal) ---
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formBirthYear, setFormBirthYear] = useState<number>(1990);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formCustomFields, setFormCustomFields] = useState<Record<string, string>>({});
  const [newTagInput, setNewTagInput] = useState('');

  // --- Auto-calculated values based on Birth Year ---
  const formCalculatedAge = CURRENT_YEAR - formBirthYear;
  const formCalculatedAgeGroup = useMemo(() => {
    const age = formCalculatedAge;
    if (age >= 20 && age <= 29) return '20대';
    if (age >= 30 && age <= 39) return '30대';
    if (age >= 40 && age <= 49) return '40대';
    if (age >= 50 && age <= 59) return '50대';
    if (age >= 60 && age <= 69) return '60대';
    return '기타';
  }, [formCalculatedAge]);

  // Handle phone format automatically
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 3 && val.length <= 7) {
      val = val.substring(0, 3) + '-' + val.substring(3);
    } else if (val.length > 7) {
      val = val.substring(0, 3) + '-' + val.substring(3, 7) + '-' + val.substring(7, 11);
    }
    setFormPhone(val);
  };

  // --- Open Add Form ---
  const openAddModal = () => {
    setEditingPerson(null);
    setFormName('');
    setFormPhone('');
    setFormAddress('');
    setFormBirthYear(1990);
    setFormTags([]);
    const initialFields: Record<string, string> = {};
    customFields.forEach(cf => {
      initialFields[cf.id] = '';
    });
    setFormCustomFields(initialFields);
    setNewTagInput('');
    setIsFormOpen(true);
  };

  // --- Open Edit Form ---
  const openEditModal = (person: Person, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPerson(person);
    setFormName(person.name);
    setFormPhone(person.phone);
    setFormAddress(person.address);
    setFormBirthYear(person.birthYear);
    setFormTags(person.tags);
    const currentCustomValues: Record<string, string> = {};
    customFields.forEach(cf => {
      currentCustomValues[cf.id] = person.customFields[cf.id] || '';
    });
    setFormCustomFields(currentCustomValues);
    setNewTagInput('');
    setIsFormOpen(true);
  };

  // --- Handle Person Submission ---
  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('이름을 입력해 주세요.');
      return;
    }

    const calculatedGroup = formCalculatedAgeGroup;

    if (editingPerson) {
      // Edit mode
      setPeople(prev =>
        prev.map(p =>
          p.id === editingPerson.id
            ? {
                ...p,
                name: formName.trim(),
                phone: formPhone.trim(),
                address: formAddress.trim(),
                birthYear: formBirthYear,
                ageGroup: calculatedGroup as any,
                tags: formTags,
                customFields: formCustomFields
              }
            : p
        )
      );
      // Update details pane state immediately
      if (selectedPerson && selectedPerson.id === editingPerson.id) {
        setSelectedPerson({
          ...selectedPerson,
          name: formName.trim(),
          phone: formPhone.trim(),
          address: formAddress.trim(),
          birthYear: formBirthYear,
          ageGroup: calculatedGroup as any,
          tags: formTags,
          customFields: formCustomFields
        });
      }
    } else {
      // Create mode
      const newPerson: Person = {
        id: `person_${Date.now()}`,
        name: formName.trim(),
        phone: formPhone.trim(),
        address: formAddress.trim(),
        birthYear: formBirthYear,
        ageGroup: calculatedGroup as any,
        tags: formTags,
        customFields: formCustomFields,
        createdAt: new Date().toISOString()
      };
      setPeople(prev => [newPerson, ...prev]);
      // Auto select the newly created person to display on the side panel
      setSelectedPerson(newPerson);
    }

    setIsFormOpen(false);
  };

  // --- Delete Person ---
  const handleDeletePerson = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('정말로 이 인물 정보를 삭제하시겠습니까?')) {
      setPeople(prev => prev.filter(p => p.id !== id));
      if (selectedPerson && selectedPerson.id === id) {
        setSelectedPerson(null);
      }
    }
  };

  // --- Dynamic Tags Pool Creation ---
  const handleAddNewTag = () => {
    const cleanTag = newTagInput.trim();
    if (!cleanTag) return;
    if (tagsPool.includes(cleanTag)) {
      alert('이미 존재하는 태그입니다.');
      return;
    }
    setTagsPool(prev => [...prev, cleanTag]);
    setFormTags(prev => [...prev, cleanTag]);
    setNewTagInput('');
  };

  // --- Global Custom Field Definitions Management ---
  const handleCreateCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newFieldName.trim();
    if (!cleanName) return;

    if (customFields.some(cf => cf.name.toLowerCase() === cleanName.toLowerCase())) {
      alert('이미 동일한 이름의 사용자 정의 필드가 존재합니다.');
      return;
    }

    const fieldId = `field_${Date.now()}`;
    const newField: CustomFieldDefinition = {
      id: fieldId,
      name: cleanName,
      type: newFieldType
    };

    setCustomFields(prev => [...prev, newField]);
    setNewFieldName('');
    setFormCustomFields(prev => ({
      ...prev,
      [fieldId]: ''
    }));
  };

  const handleDeleteCustomField = (fieldId: string) => {
    if (window.confirm('이 사용자 정의 필드를 정말로 삭제하시겠습니까? 해당 필드에 기록된 모든 정보도 함께 제거됩니다.')) {
      setCustomFields(prev => prev.filter(cf => cf.id !== fieldId));
      setPeople(prev =>
        prev.map(p => {
          const updatedCF = { ...p.customFields };
          delete updatedCF[fieldId];
          return { ...p, customFields: updatedCF };
        })
      );
      if (selectedPerson) {
        const updatedCF = { ...selectedPerson.customFields };
        delete updatedCF[fieldId];
        setSelectedPerson({ ...selectedPerson, customFields: updatedCF });
      }
    }
  };

  // --- Filter and Search Logic ---
  const filteredPeople = useMemo(() => {
    return people
      .filter(person => {
        // 1. Search Query Match
        const query = searchQuery.trim().toLowerCase();
        if (query) {
          const nameMatch = person.name.toLowerCase().includes(query);
          const phoneMatch = person.phone.includes(query);
          const addressMatch = person.address.toLowerCase().includes(query);
          const customFieldMatch = Object.entries(person.customFields).some(([fid, val]) => {
            const fieldDef = customFields.find(cf => cf.id === fid);
            if (fieldDef && fieldDef.type === 'text' && typeof val === 'string') {
              return val.toLowerCase().includes(query);
            }
            return false;
          });

          if (!nameMatch && !phoneMatch && !addressMatch && !customFieldMatch) {
            return false;
          }
        }

        // 2. Age Group Filter Match
        if (selectedAgeGroups.length > 0) {
          if (!selectedAgeGroups.includes(person.ageGroup)) {
            return false;
          }
        }

        // 3. Tags Filter Match
        if (selectedTags.length > 0) {
          if (tagMatchMode === 'AND') {
            const hasAllTags = selectedTags.every(tag => person.tags.includes(tag));
            if (!hasAllTags) return false;
          } else {
            const hasAnyTag = selectedTags.some(tag => person.tags.includes(tag));
            if (!hasAnyTag) return false;
          }
        }

        // 4. Birth Year Range Filter
        if (minBirthYear.trim()) {
          const min = parseInt(minBirthYear);
          if (!isNaN(min) && person.birthYear < min) {
            return false;
          }
        }
        if (maxBirthYear.trim()) {
          const max = parseInt(maxBirthYear);
          if (!isNaN(max) && person.birthYear > max) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name, 'ko-KR');
        } else if (sortBy === 'birthYear') {
          comparison = a.birthYear - b.birthYear;
        } else if (sortBy === 'createdAt') {
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortBy === 'lastContact') {
          const dateA = a.customFields['field_last_contact'] || '';
          const dateB = b.customFields['field_last_contact'] || '';
          if (!dateA && !dateB) {
            comparison = 0;
          } else if (!dateA) {
            comparison = sortOrder === 'asc' ? 1 : -1;
          } else if (!dateB) {
            comparison = sortOrder === 'asc' ? -1 : 1;
          } else {
            comparison = dateA.localeCompare(dateB);
          }
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [people, searchQuery, selectedAgeGroups, selectedTags, tagMatchMode, minBirthYear, maxBirthYear, sortBy, sortOrder, customFields]);

  // --- Interactive Statistics Helpers ---
  const statsSummary = useMemo(() => {
    const total = people.length;
    if (total === 0) return { total: 0, avgAge: 0, tagCounts: [] };

    const totalAge = people.reduce((acc, curr) => acc + (CURRENT_YEAR - curr.birthYear), 0);
    const avgAge = Math.round(totalAge / total);

    const tagCountsMap: Record<string, number> = {};
    people.forEach(p => {
      p.tags.forEach(t => {
        tagCountsMap[t] = (tagCountsMap[t] || 0) + 1;
      });
    });

    const tagCounts = Object.entries(tagCountsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { total, avgAge, tagCounts };
  }, [people]);

  return (
    <div className="h-screen w-full flex flex-col bg-[#f1f5f9] overflow-hidden text-slate-800 antialiased font-sans">
      
      {/* 1. TOP HEADER (Slate-800 Dark Theme) */}
      <header className="h-[60px] bg-[#1e293b] flex items-center justify-between px-6 text-white shrink-0 shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[#3b82f6] text-white p-1.5 rounded-lg flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold tracking-tight text-white flex items-center gap-2">
              Persona Archive <span className="text-[11px] bg-slate-700 text-slate-300 font-semibold px-2 py-0.5 rounded-full">v1.1</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">사람 정보를 연령대, 성향 태그, 사용자 정의 필드로 기록하는 고밀도 저장소</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFieldManagerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition cursor-pointer"
            title="사용자 정의 필드 관리"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">커스텀 필드 설정</span>
          </button>
          
          <button
            onClick={openAddModal}
            className="bg-[#3b82f6] hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-bold transition flex items-center gap-1.5 border border-blue-500 shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ 새 정보 등록</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN APPLICATION CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR: FILTERS PANEL (Width 280px, Dense layout) */}
        <aside className="w-[280px] bg-white border-r border-[#e2e8f0] p-4 flex flex-col gap-5 overflow-y-auto shrink-0 select-none">
          
          {/* Quick Clear Filter Option */}
          {(searchQuery || selectedAgeGroups.length > 0 || selectedTags.length > 0 || minBirthYear || maxBirthYear) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center justify-between text-xs animate-in fade-in duration-250">
              <span className="font-semibold text-amber-800">필터 적용 중</span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedAgeGroups([]);
                  setSelectedTags([]);
                  setMinBirthYear('');
                  setMaxBirthYear('');
                }}
                className="text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer bg-transparent border-none text-[11px]"
              >
                필터 초기화
              </button>
            </div>
          )}

          {/* Section A: Age Group Grid */}
          <section className="space-y-2">
            <h3 className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase flex items-center justify-between">
              <span>연령대 필터</span>
              <span className="text-[10px] text-slate-400 normal-case">다중 선택 가능</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setSelectedAgeGroups([])}
                className={`text-[12px] py-1.5 px-2.5 border rounded-md text-center transition cursor-pointer font-medium ${
                  selectedAgeGroups.length === 0
                    ? 'bg-[#3b82f6] text-white border-[#3b82f6] font-semibold'
                    : 'bg-[#f8fafc] border-[#e2e8f0] text-slate-600 hover:bg-slate-50'
                }`}
              >
                전체 보기
              </button>
              {['20대', '30대', '40대', '50대', '60대', '기타'].map(age => {
                const isSelected = selectedAgeGroups.includes(age);
                return (
                  <button
                    key={age}
                    onClick={() => {
                      setSelectedAgeGroups(prev =>
                        prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]
                      );
                    }}
                    className={`text-[12px] py-1.5 px-2 border rounded-md text-center transition cursor-pointer font-medium ${
                      isSelected
                        ? 'bg-[#3b82f6] text-white border-[#3b82f6] font-semibold'
                        : 'bg-[#f8fafc] border-[#e2e8f0] text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {age}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section B: Birth Year Range (Requested Theme addition) */}
          <section className="space-y-2">
            <h3 className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">출생년도 범위</h3>
            <div className="flex items-center gap-1.5 bg-[#f8fafc] border border-[#e2e8f0] p-2 rounded-md">
              <input
                type="number"
                value={minBirthYear}
                onChange={(e) => setMinBirthYear(e.target.value)}
                placeholder="1970"
                className="w-full text-xs py-1 px-1.5 border border-slate-200 rounded-md bg-white text-slate-700 text-center font-mono focus:outline-hidden focus:border-blue-500"
              />
              <span className="text-slate-400 text-xs font-semibold">~</span>
              <input
                type="number"
                value={maxBirthYear}
                onChange={(e) => setMaxBirthYear(e.target.value)}
                placeholder="2026"
                className="w-full text-xs py-1 px-1.5 border border-slate-200 rounded-md bg-white text-slate-700 text-center font-mono focus:outline-hidden focus:border-blue-500"
              />
              {(minBirthYear || maxBirthYear) && (
                <button
                  onClick={() => { setMinBirthYear(''); setMaxBirthYear(''); }}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                  title="출생년도 범위 초기화"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </section>

          {/* Section C: Behaviour Tags cloud (Theme matches behavior-tag class) */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">태그 필터</h3>
              <button
                onClick={() => setTagMatchMode(prev => prev === 'OR' ? 'AND' : 'OR')}
                className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-sm font-semibold hover:bg-slate-200 transition cursor-pointer"
                title="태그 결합 연산 변경"
              >
                {tagMatchMode === 'OR' ? '하나만 만족(OR)' : '모두 일치(AND)'}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto border border-slate-100 p-2 rounded-lg bg-[#f8fafc]/50">
              {tagsPool.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <span
                    key={tag}
                    onClick={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      );
                    }}
                    className={`behavior-tag text-[11px] px-2.5 py-1 rounded-md border cursor-pointer select-none transition duration-150 ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-xs'
                        : 'bg-white border-[#e2e8f0] text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tag}
                  </span>
                );
              })}
              {tagsPool.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-400 w-full">등록된 태그가 없습니다.</div>
              )}
            </div>
          </section>

          {/* Section D: Sidebar Analytics & Mini Graphs */}
          <section className="mt-auto border-t border-[#e2e8f0] pt-4 space-y-3 select-none">
            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-[#64748b] font-bold uppercase">
                <span>데이터 아카이브 요약</span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">전체 등록 인물</span>
                  <span className="text-slate-800 font-mono">{statsSummary.total}명</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">인물 평균 연령</span>
                  <span className="text-slate-800 font-mono">{statsSummary.avgAge}세</span>
                </div>
              </div>

              {/* Tag Occurrence mini list */}
              {statsSummary.tagCounts.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">빈도 높은 대표 특성</span>
                  <div className="space-y-1">
                    {statsSummary.tagCounts.map(tc => {
                      const percent = Math.round((tc.count / statsSummary.total) * 100);
                      return (
                        <div key={tc.name} className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
                          <span className="truncate max-w-[120px]">{tc.name}</span>
                          <span className="font-mono text-slate-400">{tc.count}명 ({percent}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

        </aside>

        {/* DATA VIEWPORT: SEARCH + HIGH DENSITY DATA TABLE */}
        <section className="flex-1 flex flex-col bg-white overflow-hidden">
          
          {/* SEARCH BAR CONTAINER (Theme: search-bar-container, padding 16px) */}
          <div className="search-bar-container shrink-0 bg-white border-b border-[#e2e8f0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 select-none">
            
            {/* Search Input box */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-[#64748b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이름, 연락처, 주소, 커스텀 텍스트 정보를 고밀도로 검색해 보세요..."
                className="search-input w-full pl-9 pr-4 py-2 text-xs border border-[#cbd5e1] rounded-md focus:outline-hidden focus:border-blue-500 bg-[#f8fafc]/50 font-medium"
              />
            </div>

            {/* Sorthing & Action Utilities */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase hidden md:inline">정렬</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs bg-white border border-slate-200 rounded-md py-1.5 px-2 font-semibold text-slate-600 cursor-pointer focus:outline-hidden focus:border-blue-500"
                >
                  <option value="createdAt">등록일 기준</option>
                  <option value="name">이름 가나다순</option>
                  <option value="birthYear">출생연도 기준</option>
                  <option value="lastContact">마지막 연락일 기준</option>
                </select>
              </div>

              {/* Sort Order Button Toggle */}
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-md text-slate-600 transition cursor-pointer flex items-center justify-center"
                title={sortOrder === 'asc' ? '오름차순 정렬 중' : '내림차순 정렬 중'}
              >
                <ArrowUpDown className="w-4 h-4 text-slate-500" />
              </button>

              <div className="border-l border-slate-200 h-5 my-auto mx-1"></div>

              {/* Counts */}
              <span className="text-xs font-bold text-slate-500 bg-[#f1f5f9] px-2.5 py-1.5 rounded-md border border-slate-200 font-mono">
                결과: {filteredPeople.length} / {people.length}명
              </span>
            </div>
          </div>

          {/* SPREADSHEET HIGH-DENSITY DATA TABLE CONTAINER */}
          <div className="flex-1 overflow-auto bg-slate-50">
            {filteredPeople.length > 0 ? (
              <table className="data-table min-w-full">
                <thead>
                  <tr className="sticky top-0 z-10 select-none">
                    <th className="w-[110px]">이름</th>
                    <th className="w-[85px] text-center">출생년도</th>
                    <th className="w-[85px] text-center">나이(대)</th>
                    <th className="w-[140px]">연락처</th>
                    <th className="w-[200px]">거주 주소</th>
                    <th>성향 및 특성 유형 태그</th>
                    {customFields.length > 0 && <th className="w-[180px]">사용자 정의 정보</th>}
                    <th className="w-[90px] text-center">동작</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filteredPeople.map(person => {
                    const isSelected = selectedPerson?.id === person.id;
                    return (
                      <tr
                        key={person.id}
                        onClick={() => setSelectedPerson(person)}
                        className={`group transition-all duration-100 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/75 hover:bg-blue-100/70 border-l-4 border-blue-500'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        {/* Name Column */}
                        <td className="font-semibold text-slate-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200/80 flex items-center justify-center text-[11px] font-black text-slate-600 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                            {person.name.substring(0, 1)}
                          </div>
                          <span className="truncate">{person.name}</span>
                        </td>

                        {/* Birth Year Column */}
                        <td className="text-center font-mono font-medium text-slate-600">{person.birthYear}년생</td>

                        {/* Calculated Age(Group) Column */}
                        <td className="text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 rounded-md">
                            {person.ageGroup}
                          </span>
                        </td>

                        {/* Phone Number Column */}
                        <td className="font-mono text-slate-600">{person.phone || <span className="text-slate-300 italic">미지정</span>}</td>

                        {/* Address Column */}
                        <td className="text-slate-500 font-medium max-w-[200px] truncate" title={person.address}>
                          {person.address || <span className="text-slate-300 italic">미지정</span>}
                        </td>

                        {/* Personality Tags Badges Column (Theme styled) */}
                        <td>
                          <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
                            {person.tags.map(tag => (
                              <span
                                key={tag}
                                className={`tag-badge px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTagBadgeStyle(tag)}`}
                              >
                                {tag}
                              </span>
                            ))}
                            {person.tags.length === 0 && (
                              <span className="text-[11px] text-slate-300 italic">지정 없음</span>
                            )}
                          </div>
                        </td>

                        {/* Dynamic Custom Fields summary list inside table cell */}
                        {customFields.length > 0 && (
                          <td className="text-xs text-slate-500 font-medium max-w-[180px] truncate">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {customFields.map(cf => {
                                const val = person.customFields[cf.id];
                                if (!val) return null;
                                return (
                                  <span
                                    key={cf.id}
                                    className="bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded-md border border-slate-200/60 text-[10px] font-semibold flex items-center gap-0.5 shrink-0"
                                    title={`${cf.name}: ${val}`}
                                  >
                                    <span className="text-slate-400 font-medium">{cf.name}:</span>
                                    <span className="text-slate-700 font-extrabold">{val}</span>
                                  </span>
                                );
                              })}
                              {!Object.values(person.customFields).some(Boolean) && (
                                <span className="text-[10px] text-slate-300 italic">입력된 커스텀 값 없음</span>
                              )}
                            </div>
                          </td>
                        )}

                        {/* Action buttons Column */}
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1 select-none">
                            <button
                              onClick={(e) => openEditModal(person, e)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                              title="정보 수정"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeletePerson(person.id, e)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                              title="인물 정보 제거"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* High density Empty State fallback */
              <div className="p-16 text-center bg-white border border-slate-200 rounded-xl m-6 space-y-4 shadow-xs select-none">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-200">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800">조건과 일치하는 검색 인물이 존재하지 않습니다.</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">왼쪽 필터에서 검색 조건을 변경하거나 초기화 버튼을 누르고, 새로운 아카이브에 기입을 고려하세요.</p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedAgeGroups([]);
                    setSelectedTags([]);
                    setMinBirthYear('');
                    setMaxBirthYear('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-[#f8fafc] border border-slate-200 hover:bg-slate-50 rounded-lg transition duration-150 cursor-pointer"
                >
                  필터 조건 전체 해제
                </button>
              </div>
            )}
          </div>

        </section>

        {/* 3. RIGHT HAND DRAWER / SIDE PANE: DETAILED LOOKUP (Fits 100% of the High Density Dashboard vibe) */}
        {selectedPerson && (
          <aside className="w-[320px] bg-[#f8fafc] border-l border-[#e2e8f0] flex flex-col overflow-hidden shrink-0 select-none animate-in slide-in-from-right duration-200">
            
            {/* Title Section */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xs font-black text-indigo-700">
                  {selectedPerson.name.substring(0, 1)}
                </div>
                <div>
                  <h2 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    {selectedPerson.name}
                    <span className="text-[10px] font-normal text-slate-400">상세 프로필</span>
                  </h2>
                  <span className="text-[10px] text-slate-400 font-semibold">{selectedPerson.birthYear}년생 ({CURRENT_YEAR - selectedPerson.birthYear}세, {selectedPerson.ageGroup})</span>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedPerson(null)}
                className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition cursor-pointer"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile fields content */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              
              {/* Primary Personal Info */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 space-y-3 shadow-2xs">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block border-b border-slate-100 pb-1.5">기본 연락 인적 사항</span>
                
                <div className="space-y-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-semibold block text-[10px]">연락처 (휴대폰 번호)</span>
                    <span className="font-mono text-slate-800 font-bold block">{selectedPerson.phone || '등록되지 않음'}</span>
                  </div>
                  
                  <div className="space-y-0.5 pt-1.5 border-t border-slate-50">
                    <span className="text-slate-400 font-semibold block text-[10px]">거주지 주소</span>
                    <span className="text-slate-700 font-medium block leading-relaxed">{selectedPerson.address || '등록되지 않음'}</span>
                  </div>
                </div>
              </div>

              {/* Behavior style and Personality Tags */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 space-y-2.5 shadow-2xs">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block border-b border-slate-100 pb-1.5">유형 및 특성 태그</span>
                
                <div className="flex flex-wrap gap-1.5">
                  {selectedPerson.tags.map(tag => (
                    <span
                      key={tag}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md border tracking-tight ${getTagBadgeStyle(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                  {selectedPerson.tags.length === 0 && (
                    <span className="text-xs text-slate-400 italic font-medium block">할당된 유형별 태그가 없습니다.</span>
                  )}
                </div>
              </div>

              {/* Custom Defined Keys & Values */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 space-y-2.5 shadow-2xs">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block border-b border-slate-100 pb-1.5">사용자 지정 추가 항목</span>
                
                <div className="divide-y divide-slate-100 text-xs">
                  {customFields.map(cf => {
                    const value = selectedPerson.customFields[cf.id];
                    return (
                      <div key={cf.id} className="py-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate text-slate-500">
                          {cf.type === 'number' && <Hash className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                          {cf.type === 'date' && <CalendarDays className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                          {cf.type === 'text' && <Type className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                          <span className="font-bold text-slate-600 truncate">{cf.name}</span>
                        </div>
                        <span className="font-bold text-slate-800 bg-slate-100/70 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] max-w-[120px] truncate">
                          {value || <span className="text-slate-300 font-normal italic">미지정</span>}
                        </span>
                      </div>
                    );
                  })}
                  {customFields.length === 0 && (
                    <div className="text-center py-4 text-[11px] text-slate-400 font-semibold">
                      등록된 맞춤형 필드가 없습니다.<br />위의 필드 설정을 이용하세요.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Panel controls inside detail section */}
            <div className="p-3 bg-white border-t border-slate-200 space-y-2 shrink-0">
              <button
                onClick={(e) => openEditModal(selectedPerson, e)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md transition shadow-sm cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>이 인물 정보 수정</span>
              </button>
              
              <button
                onClick={(e) => handleDeletePerson(selectedPerson.id, e)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-md transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>데이터 영구 삭제</span>
              </button>
            </div>

          </aside>
        )}

      </div>


      {/* --- MODAL 1: ADD & EDIT PERSON FORM --- */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-300 shadow-2xl w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  {editingPerson ? '인물 기록 정보 수정' : '새로운 Persona 등록'}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">이름, 연락처, 맞춤형 성향 태그 및 정밀 세부 사항을 지정합니다.</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSavePerson}>
              <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <span>성함 / 이름</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="예: 김지우"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Birth Year Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">출생 연도 (몇년생)</label>
                    <select
                      value={formBirthYear}
                      onChange={(e) => setFormBirthYear(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-500 bg-white cursor-pointer"
                    >
                      {Array.from({ length: 97 }, (_, i) => 2026 - i).map(year => (
                        <option key={year} value={year}>{year}년생</option>
                      ))}
                    </select>
                  </div>

                  {/* Auto calculated Age Group Indicator */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">자동 분류 결과</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-700 flex items-center justify-between font-bold">
                      <span>{formCalculatedAgeGroup}</span>
                      <span className="text-slate-400 font-mono text-[10px]">나이: {formCalculatedAge}세</span>
                    </div>
                  </div>
                </div>

                {/* Phone & Address */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">휴대폰 번호</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={handlePhoneChange}
                      placeholder="010-0000-0000"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">거주 주소지</label>
                    <input
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder="예: 서울시 마포구"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* Personality Tags Selection & Creation */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                    <span>유형 태그 할당 (중복 선택 가능)</span>
                    <span className="text-[10px] text-slate-400 font-normal">태그를 재클릭하면 취소됩니다.</span>
                  </label>

                  {/* Active tags selector box */}
                  <div className="flex flex-wrap gap-1 p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-md max-h-[110px] overflow-y-auto">
                    {tagsPool.map(tag => {
                      const isSelected = formTags.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => {
                            setFormTags(prev =>
                              prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                            );
                          }}
                          className={`px-2 py-0.5 text-[10px] rounded-md border font-semibold transition cursor-pointer select-none ${
                            isSelected
                              ? getTagBadgeStyle(tag) + ' ring-1 ring-blue-500'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add dynamic new tag inline */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="태그 풀에 직접 추가... (예: 성격 급함)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewTag();
                        }
                      }}
                      className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewTag}
                      className="px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition shrink-0 cursor-pointer"
                    >
                      태그 추가
                    </button>
                  </div>
                </div>

                {/* Dynamically Rendered Custom Fields */}
                <div className="pt-3 border-t border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-blue-500" />
                      <span>사용자 정의 추가 필드 양식</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFieldManagerOpen(true);
                      }}
                      className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      설정 변경
                    </button>
                  </div>

                  {customFields.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {customFields.map(cf => (
                        <div key={cf.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-slate-700 flex items-center gap-1">
                              {cf.type === 'number' && <Hash className="w-3 h-3 text-blue-400 shrink-0" />}
                              {cf.type === 'date' && <CalendarDays className="w-3 h-3 text-blue-400 shrink-0" />}
                              {cf.type === 'text' && <Type className="w-3 h-3 text-blue-400 shrink-0" />}
                              <span className="truncate max-w-[100px]">{cf.name}</span>
                            </span>
                          </div>
                          <input
                            type={cf.type === 'number' ? 'number' : cf.type === 'date' ? 'date' : 'text'}
                            value={formCustomFields[cf.id] || ''}
                            onChange={(e) => {
                              setFormCustomFields(prev => ({
                                ...prev,
                                [cf.id]: e.target.value
                              }));
                            }}
                            placeholder={`${cf.name} 정보...`}
                            className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-500 bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-md p-3 border border-slate-200 text-center text-xs text-slate-500">
                      <p className="font-semibold text-slate-600">등록된 추가 정보 필드가 없습니다.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsFieldManagerOpen(true);
                        }}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        첫 사용자 정의 필드 추가해보기 <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Action Footer */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md shadow-sm transition cursor-pointer border border-blue-500"
                >
                  기록 저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* --- MODAL 2: GLOBAL CUSTOM FIELDS DEFINITION MANAGER --- */}
      {isFieldManagerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-slate-300 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                  <Database className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">사용자 정의 필드 관리</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">원하는 메타정보(MBTI, 메모, 점수)를 동적으로 만듭니다.</p>
                </div>
              </div>
              <button
                onClick={() => setIsFieldManagerOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Field Creation Form */}
              <form onSubmit={handleCreateCustomField} className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-3">
                <h3 className="text-[11px] font-bold text-slate-700">새로운 맞춤형 정보 양식 추가</h3>
                
                <div className="grid grid-cols-1 gap-2">
                  {/* Field Name */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">필드(기록 컬럼) 이름</span>
                    <input
                      type="text"
                      required
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="예: MBTI, 연봉, 만난 경로, 인상 점수"
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-500 bg-white"
                    />
                  </div>

                  {/* Field Type */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">입력 데이터 형식</span>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as any)}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-500 bg-white cursor-pointer"
                    >
                      <option value="text">텍스트 형식 (기타 메모, 문장)</option>
                      <option value="number">숫자 수치 형식 (우선순위 점수)</option>
                      <option value="date">달력 날짜 형식 (마지막 조우일)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>추가 양식 반영</span>
                  </button>
                </div>
              </form>

              {/* Existing Fields List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between select-none">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">현재 운영 중인 맞춤형 정보 목록</h3>
                  <span className="text-[10px] text-slate-400 font-bold">총 {customFields.length}개</span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 bg-white max-h-48 overflow-y-auto">
                  {customFields.map(cf => (
                    <div key={cf.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50/50 transition">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-md shrink-0">
                          {cf.type === 'number' && <Hash className="w-3 h-3 text-blue-500" />}
                          {cf.type === 'date' && <CalendarDays className="w-3 h-3 text-blue-500" />}
                          {cf.type === 'text' && <Type className="w-3 h-3 text-blue-500" />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-xs block">{cf.name}</span>
                          <span className="text-[9px] text-slate-400 font-semibold block uppercase">
                            {cf.type === 'text' && '텍스트'}
                            {cf.type === 'number' && '숫자 수치'}
                            {cf.type === 'date' && '날짜 달력'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCustomField(cf.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                        title="사용자 정의 필드 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {customFields.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">
                      등록된 사용자 정의 추가 항목이 존재하지 않습니다.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsFieldManagerOpen(false)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition cursor-pointer"
              >
                관리 완료 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
