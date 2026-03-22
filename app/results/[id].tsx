import { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthContext } from 'context/AuthContext';
import { DataContext } from 'context/DataContext';
import { ArrowLeft, ChevronDown, ChevronUp, TriangleAlert as AlertTriangle, Filter, Check } from 'lucide-react-native';

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { getQuestionById } = useContext(DataContext);
  
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [sortField, setSortField] = useState<'nombre' | 'votos' | 'opcion'>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [totals, setTotals] = useState({
    approve: 0,
    reject: 0,
    abstain: 0,
    total: 0,
  });
  
  useEffect(() => {
    const loadQuestion = async () => {
      const questionData = await getQuestionById(id);
      setQuestion(questionData);
      
      if (questionData?.votos) {
        const approve = questionData.votos
          .filter((v: any) => v.opcion === 'apruebo')
          .reduce((sum: number, v: any) => sum + v.cantidad_votos, 0);
          
        const reject = questionData.votos
          .filter((v: any) => v.opcion === 'rechazo')
          .reduce((sum: number, v: any) => sum + v.cantidad_votos, 0);
          
        const abstain = questionData.votos
          .filter((v: any) => v.opcion === 'abstengo')
          .reduce((sum: number, v: any) => sum + v.cantidad_votos, 0);
        
        setTotals({
          approve,
          reject,
          abstain,
          total: approve + reject + abstain,
        });
      }
      
      setLoading(false);
    };
    
    loadQuestion();
  }, [id]);
  
  const toggleSort = (field: 'nombre' | 'votos' | 'opcion') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const sortedVotes = question?.votos ? [...question.votos].sort((a, b) => {
    if (sortField === 'nombre') {
      const nameA = a.nombre_usuario || '';
      const nameB = b.nombre_usuario || '';
      return sortDirection === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } else if (sortField === 'votos') {
      return sortDirection === 'asc'
        ? a.cantidad_votos - b.cantidad_votos
        : b.cantidad_votos - a.cantidad_votos;
    } else {
      const optionA = a.opcion || '';
      const optionB = b.opcion || '';
      return sortDirection === 'asc'
        ? optionA.localeCompare(optionB)
        : optionB.localeCompare(optionA);
    }
  }) : [];
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }
  
  if (!question) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={48} color="#ef4444" />
        <Text style={styles.errorText}>
          No se encontró la pregunta solicitada.
        </Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const getPercentage = (value: number) => {
    if (totals.total === 0) return 0;
    return Math.round((value / totals.total) * 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backIcon}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resultados</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.texto_pregunta}</Text>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Estado:</Text>
            <View style={[
              styles.statusBadge,
              question.estado === 'activa' ? styles.activeBadge : 
              question.estado === 'unanimidad' ? styles.unanimityBadge :
              styles.closedBadge
            ]}>
              <Text style={[
                styles.statusBadgeText,
                question.estado === 'activa' ? styles.activeText : 
                question.estado === 'unanimidad' ? styles.unanimityText :
                styles.closedText
              ]}>
                {question.estado === 'activa' ? 'Activa' : 
                 question.estado === 'unanimidad' ? 'Aprobada por Unanimidad' :
                 'Cerrada'}
              </Text>
            </View>
          </View>
        </View>
        
        {question.estado === 'unanimidad' ? (
          <View style={styles.unanimityContainer}>
            <Check size={48} color="#059669" />
            <Text style={styles.unanimityTitle}>Aprobada por Unanimidad</Text>
            <Text style={styles.unanimityDescription}>
              Esta pregunta ha sido aprobada por unanimidad por decisión administrativa.
            </Text>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Resultados Generales</Text>
            
            <View style={styles.resultRow}>
              <View style={[styles.optionBadge, styles.approveOptionBadge]}>
                <Text style={styles.optionBadgeText}>Apruebo</Text>
              </View>
              
              <View style={styles.resultBarContainer}>
                <View style={[
                  styles.resultBar, 
                  styles.approveBar,
                  { width: `${getPercentage(totals.approve)}%` }
                ]} />
              </View>
              
              <View style={styles.resultValues}>
                <Text style={styles.resultCount}>{totals.approve}</Text>
                <Text style={styles.resultPercent}>
                  {getPercentage(totals.approve)}%
                </Text>
              </View>
            </View>
            
            <View style={styles.resultRow}>
              <View style={[styles.optionBadge, styles.rejectOptionBadge]}>
                <Text style={styles.optionBadgeText}>Rechazo</Text>
              </View>
              
              <View style={styles.resultBarContainer}>
                <View style={[
                  styles.resultBar, 
                  styles.rejectBar,
                  { width: `${getPercentage(totals.reject)}%` }
                ]} />
              </View>
              
              <View style={styles.resultValues}>
                <Text style={styles.resultCount}>{totals.reject}</Text>
                <Text style={styles.resultPercent}>
                  {getPercentage(totals.reject)}%
                </Text>
              </View>
            </View>
            
            <View style={styles.resultRow}>
              <View style={[styles.optionBadge, styles.abstainOptionBadge]}>
                <Text style={styles.optionBadgeText}>Abstención</Text>
              </View>
              
              <View style={styles.resultBarContainer}>
                <View style={[
                  styles.resultBar, 
                  styles.abstainBar,
                  { width: `${getPercentage(totals.abstain)}%` }
                ]} />
              </View>
              
              <View style={styles.resultValues}>
                <Text style={styles.resultCount}>{totals.abstain}</Text>
                <Text style={styles.resultPercent}>
                  {getPercentage(totals.abstain)}%
                </Text>
              </View>
            </View>
            
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total de votos:</Text>
              <Text style={styles.totalValue}>{totals.total}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.detailsToggleButton}
              onPress={() => setShowDetails(!showDetails)}
            >
              <Text style={styles.detailsToggleText}>
                {showDetails ? 'Ocultar detalle' : 'Ver detalle'}
              </Text>
              {showDetails ? (
                <ChevronUp size={20} color="#64748b" />
              ) : (
                <ChevronDown size={20} color="#64748b" />
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {showDetails && question.estado !== 'unanimidad' && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>Detalle de Votos</Text>
              
              <View style={styles.sortContainer}>
                <Filter size={16} color="#64748b" />
                <Text style={styles.sortLabel}>Ordenar por:</Text>
              </View>
              
              <View style={styles.sortButtonsContainer}>
                <TouchableOpacity 
                  style={[
                    styles.sortButton,
                    sortField === 'nombre' && styles.activeSortButton
                  ]}
                  onPress={() => toggleSort('nombre')}
                >
                  <Text style={[
                    styles.sortButtonText,
                    sortField === 'nombre' && styles.activeSortText
                  ]}>
                    Nombre
                    {sortField === 'nombre' && (
                      sortDirection === 'asc' ? ' ↑' : ' ↓'
                    )}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.sortButton,
                    sortField === 'votos' && styles.activeSortButton
                  ]}
                  onPress={() => toggleSort('votos')}
                >
                  <Text style={[
                    styles.sortButtonText,
                    sortField === 'votos' && styles.activeSortText
                  ]}>
                    Votos
                    {sortField === 'votos' && (
                      sortDirection === 'asc' ? ' ↑' : ' ↓'
                    )}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.sortButton,
                    sortField === 'opcion' && styles.activeSortButton
                  ]}
                  onPress={() => toggleSort('opcion')}
                >
                  <Text style={[
                    styles.sortButtonText,
                    sortField === 'opcion' && styles.activeSortText
                  ]}>
                    Opción
                    {sortField === 'opcion' && (
                      sortDirection === 'asc' ? ' ↑' : ' ↓'
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Nombre</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Votos</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Opción</Text>
              </View>
            </View>
            
            {sortedVotes.length === 0 ? (
              <Text style={styles.noVotesText}>No hay votos registrados.</Text>
            ) : (
              sortedVotes.map((vote: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableRowText, { flex: 2 }]}>
                    {vote.nombre_usuario || 'Usuario desconocido'}
                  </Text>
                  <Text style={[styles.tableRowText, { flex: 1, textAlign: 'center' }]}>
                    {vote.cantidad_votos}
                  </Text>
                  <View style={[
                    styles.voteOptionBadge,
                    vote.opcion === 'apruebo' && styles.approveOptionBadge,
                    vote.opcion === 'rechazo' && styles.rejectOptionBadge,
                    vote.opcion === 'abstengo' && styles.abstainOptionBadge,
                    { flex: 1 }
                  ]}>
                    <Text style={styles.voteOptionText}>
                      {vote.opcion === 'apruebo' && 'Apruebo'}
                      {vote.opcion === 'rechazo' && 'Rechazo'}
                      {vote.opcion === 'abstengo' && 'Me abstengo'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backIcon: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1e293b',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 12,
    lineHeight: 28,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
  },
  closedBadge: {
    backgroundColor: '#f1f5f9',
  },
  unanimityBadge: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  activeText: {
    color: '#10b981',
  },
  closedText: {
    color: '#475569',
  },
  unanimityText: {
    color: '#059669',
  },
  unanimityContainer: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  unanimityTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#059669',
    marginTop: 12,
    marginBottom: 8,
  },
  unanimityDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#065f46',
    textAlign: 'center',
    lineHeight: 24,
  },
  resultsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  resultsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#334155',
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    width: 100,
    alignItems: 'center',
  },
  approveOptionBadge: {
    backgroundColor: '#dcfce7',
  },
  rejectOptionBadge: {
    backgroundColor: '#fee2e2',
  },
  abstainOptionBadge: {
    backgroundColor: '#f1f5f9',
  },
  optionBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#334155',
  },
  resultBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  resultBar: {
    height: '100%',
    minWidth: 5,
  },
  approveBar: {
    backgroundColor: '#10b981',
  },
  rejectBar: {
    backgroundColor: '#ef4444',
  },
  abstainBar: {
    backgroundColor: '#64748b',
  },
  resultValues: {
    width: 60,
    alignItems: 'flex-end',
  },
  resultCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#334155',
  },
  resultPercent: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  totalLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  totalValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#334155',
  },
  detailsToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailsToggleText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748b',
    marginRight: 4,
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailsHeader: {
    marginBottom: 12,
  },
  detailsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#334155',
    marginBottom: 12,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sortLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  sortButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sortButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#f1f5f9',
  },
  activeSortButton: {
    backgroundColor: '#e0f2fe',
  },
  sortButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#64748b',
  },
  activeSortText: {
    color: '#2563eb',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#475569',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  tableRowText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#334155',
  },
  voteOptionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  voteOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#334155',
  },
  noVotesText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    padding: 20,
  },
  backButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#475569',
  },
});