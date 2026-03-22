import { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { DataContext } from 'context/DataContext';
import { AuthContext } from 'context/AuthContext';
import { Vote, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';

export default function QuestionsScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { questions, loadQuestions } = useContext(DataContext);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      await loadQuestions();
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  // Group questions by status and voted/not voted
  const pendingQuestions = questions.filter(q => 
    q.estado === 'activa' && 
    !q.votos?.some(v => v.id_usuario === user?.id_usuario)
  );
  
  const votedQuestions = questions.filter(q => 
    q.votos?.some(v => v.id_usuario === user?.id_usuario)
  );
  
  const handleQuestionPress = (id: string) => {
    router.push(`/question/${id}`);
  };
  
  const handleResultsPress = (id: string) => {
    router.push(`/results/${id}`);
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Votaciones</Text>
        <Text style={styles.headerSubtitle}>
          Votos disponibles: <Text style={styles.voteCount}>{user?.votos_disponibles || 0}</Text>
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Pendientes ({pendingQuestions.length})
        </Text>
        
        {pendingQuestions.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle size={48} color="#10b981" />
            <Text style={styles.emptyStateText}>No tienes votaciones pendientes.</Text>
          </View>
        ) : (
          <FlatList
            data={pendingQuestions}
            keyExtractor={(item) => item.id_pregunta}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.questionCard}
                onPress={() => handleQuestionPress(item.id_pregunta)}
              >
                <View style={styles.questionHeader}>
                  <View style={styles.iconContainer}>
                    <Vote size={20} color="#ffffff" />
                  </View>
                  <View style={styles.statusContainer}>
                    <Clock size={14} color="#2563eb" />
                    <Text style={styles.statusText}>Activa</Text>
                  </View>
                </View>
                
                <Text style={styles.questionText}>
                  {item.texto_pregunta}
                </Text>
                
                <View style={styles.questionFooter}>
                  <Text style={styles.dateText}>
                    Creada: {new Date(item.fecha_creacion).toLocaleDateString()}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleQuestionPress(item.id_pregunta)}
                  >
                    <Text style={styles.actionButtonText}>Votar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.list}
          />
        )}
        
        <Text style={styles.sectionTitle}>
          Mis Votaciones ({votedQuestions.length})
        </Text>
        
        {votedQuestions.length === 0 ? (
          <View style={styles.emptyState}>
            <AlertCircle size={48} color="#94a3b8" />
            <Text style={styles.emptyStateText}>Aún no has participado en ninguna votación.</Text>
          </View>
        ) : (
          <FlatList
            data={votedQuestions}
            keyExtractor={(item) => item.id_pregunta}
            renderItem={({ item }) => {
              const userVote = item.votos?.find(v => v.id_usuario === user?.id_usuario);
              const isActive = item.estado === 'activa';
              
              return (
                <TouchableOpacity 
                  style={[styles.questionCard, !isActive && styles.closedQuestionCard]}
                  onPress={() => isActive ? null : handleResultsPress(item.id_pregunta)}
                >
                  <View style={styles.questionHeader}>
                    <View style={[
                      styles.iconContainer, 
                      !isActive && styles.closedIconContainer
                    ]}>
                      <Vote size={20} color="#ffffff" />
                    </View>
                    <View style={[
                      styles.statusContainer,
                      !isActive && styles.closedStatusContainer
                    ]}>
                      {isActive ? (
                        <>
                          <Clock size={14} color="#2563eb" />
                          <Text style={styles.statusText}>Activa</Text>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} color="#475569" />
                          <Text style={styles.closedStatusText}>Cerrada</Text>
                        </>
                      )}
                    </View>
                  </View>
                  
                  <Text style={[styles.questionText, !isActive && styles.closedQuestionText]}>
                    {item.texto_pregunta}
                  </Text>
                  
                  <View style={styles.voteInfoContainer}>
                    <Text style={styles.voteInfoLabel}>Tu voto:</Text>
                    <View style={[
                      styles.voteOptionBadge,
                      userVote?.opcion === 'apruebo' && styles.approveOptionBadge,
                      userVote?.opcion === 'rechazo' && styles.rejectOptionBadge,
                      userVote?.opcion === 'abstengo' && styles.abstainOptionBadge,
                    ]}>
                      <Text style={styles.voteOptionText}>
                        {userVote?.opcion === 'apruebo' && 'Apruebo'}
                        {userVote?.opcion === 'rechazo' && 'Rechazo'}
                        {userVote?.opcion === 'abstengo' && 'Me abstengo'}
                      </Text>
                    </View>
                    <Text style={styles.voteCountText}>
                      ({userVote?.cantidad_votos} votos)
                    </Text>
                  </View>
                  
                  <View style={styles.questionFooter}>
                    <Text style={styles.dateText}>
                      {isActive 
                        ? `Votado: ${new Date(userVote?.timestamp || Date.now()).toLocaleDateString()}`
                        : `Cerrada: ${new Date(item.fecha_cierre).toLocaleDateString()}`
                      }
                    </Text>
                    
                    {!isActive && (
                      <TouchableOpacity 
                        style={styles.resultButton}
                        onPress={() => handleResultsPress(item.id_pregunta)}
                      >
                        <Text style={styles.resultButtonText}>Ver Resultados</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#1e293b',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748b',
  },
  voteCount: {
    fontFamily: 'Inter-Bold',
    color: '#2563eb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginVertical: 16,
  },
  list: {
    paddingBottom: 12,
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  closedQuestionCard: {
    backgroundColor: '#f8fafc',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: '#2563eb',
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedIconContainer: {
    backgroundColor: '#64748b',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  closedStatusContainer: {
    backgroundColor: '#f1f5f9',
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#2563eb',
    marginLeft: 4,
  },
  closedStatusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#475569',
    marginLeft: 4,
  },
  questionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#334155',
    marginBottom: 16,
    lineHeight: 22,
  },
  closedQuestionText: {
    color: '#475569',
  },
  questionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94a3b8',
  },
  actionButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#ffffff',
  },
  resultButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resultButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#475569',
  },
  voteInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  voteInfoLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  voteOptionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  approveOptionBadge: {
    backgroundColor: '#dcfce7',
  },
  rejectOptionBadge: {
    backgroundColor: '#fee2e2',
  },
  abstainOptionBadge: {
    backgroundColor: '#f5f5f5',
  },
  voteOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#475569',
  },
  voteCountText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748b',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyStateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
  },
});