import { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AuthContext } from 'context/AuthContext';
import { DataContext } from 'context/DataContext';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';

export default function HomeScreen() {
  const { user } = useContext(AuthContext);
  const { getLastClosedQuestion } = useContext(DataContext);
  const [showDetails, setShowDetails] = useState(false);
  const [lastClosedQuestion, setLastClosedQuestion] = useState(null);
  
  useEffect(() => {
    const question = getLastClosedQuestion();
    setLastClosedQuestion(question);
  }, []);

  const calculateVotes = (question) => {
    if (!question?.votos) return { approve: 0, reject: 0, abstain: 0, total: 0 };
    
    const approve = question.votos
      .filter(v => v.opcion === 'apruebo')
      .reduce((sum, v) => sum + v.cantidad_votos, 0);
      
    const reject = question.votos
      .filter(v => v.opcion === 'rechazo')
      .reduce((sum, v) => sum + v.cantidad_votos, 0);
      
    const abstain = question.votos
      .filter(v => v.opcion === 'abstengo')
      .reduce((sum, v) => sum + v.cantidad_votos, 0);
    
    return {
      approve,
      reject,
      abstain,
      total: approve + reject + abstain
    };
  };

  const getPercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const votes = lastClosedQuestion ? calculateVotes(lastClosedQuestion) : { approve: 0, reject: 0, abstain: 0, total: 0 };
  
  const chartData = [
    { option: 'Apruebo', votes: votes.approve, color: '#10b981' },
    { option: 'Rechazo', votes: votes.reject, color: '#ef4444' },
    { option: 'Abstención', votes: votes.abstain, color: '#64748b' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sistema de Votación</Text>
        <Text style={styles.headerSubtitle}>Federación de Rodeo</Text>
      </View>

      <View style={styles.content}>
        {lastClosedQuestion ? (
          <>
            <View style={styles.questionCard}>
              <Text style={styles.questionTitle}>Última votación cerrada</Text>
              <Text style={styles.questionText}>{lastClosedQuestion.texto_pregunta}</Text>
              
              <View style={styles.chartContainer}>
                <VictoryChart
                  theme={VictoryTheme.material}
                  domainPadding={30}
                  height={250}
                >
                  <VictoryAxis
                    tickFormat={(t) => `${t}`}
                    style={{
                      tickLabels: { fontSize: 12, padding: 5 }
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    tickFormat={(t) => `${t}`}
                    style={{
                      tickLabels: { fontSize: 12, padding: 5 }
                    }}
                  />
                  <VictoryBar
                    data={chartData}
                    x="option"
                    y="votes"
                    style={{
                      data: {
                        fill: ({ datum }) => datum.color
                      }
                    }}
                  />
                </VictoryChart>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  <View style={[styles.optionBadge, styles.approveOptionBadge]}>
                    <Text style={styles.optionBadgeText}>Apruebo</Text>
                  </View>
                  <Text style={styles.statText}>
                    {votes.approve} votos ({getPercentage(votes.approve, votes.total)}%)
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <View style={[styles.optionBadge, styles.rejectOptionBadge]}>
                    <Text style={styles.optionBadgeText}>Rechazo</Text>
                  </View>
                  <Text style={styles.statText}>
                    {votes.reject} votos ({getPercentage(votes.reject, votes.total)}%)
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <View style={[styles.optionBadge, styles.abstainOptionBadge]}>
                    <Text style={styles.optionBadgeText}>Abstención</Text>
                  </View>
                  <Text style={styles.statText}>
                    {votes.abstain} votos ({getPercentage(votes.abstain, votes.total)}%)
                  </Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total de votos:</Text>
                  <Text style={styles.totalValue}>{votes.total}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => setShowDetails(!showDetails)}
              >
                <Text style={styles.detailsButtonText}>
                  {showDetails ? 'Ocultar detalle' : 'Ver detalle'}
                </Text>
                {showDetails ? (
                  <ChevronUp size={20} color="#64748b" />
                ) : (
                  <ChevronDown size={20} color="#64748b" />
                )}
              </TouchableOpacity>

              {showDetails && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>Detalle de votos</Text>
                  {lastClosedQuestion.votos?.map((vote, index) => (
                    <View key={index} style={styles.voteRow}>
                      <Text style={styles.voterName}>{vote.nombre_usuario}</Text>
                      <View style={[
                        styles.voteOptionBadge,
                        vote.opcion === 'apruebo' && styles.approveOptionBadge,
                        vote.opcion === 'rechazo' && styles.rejectOptionBadge,
                        vote.opcion === 'abstengo' && styles.abstainOptionBadge,
                      ]}>
                        <Text style={styles.voteOptionText}>
                          {vote.opcion === 'apruebo' && 'Apruebo'}
                          {vote.opcion === 'rechazo' && 'Rechazo'}
                          {vote.opcion === 'abstengo' && 'Me abstengo'}
                        </Text>
                      </View>
                      <Text style={styles.voteCount}>
                        {vote.cantidad_votos} votos
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No hay votaciones cerradas para mostrar
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
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
  content: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 8,
  },
  questionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#475569',
    marginBottom: 20,
  },
  chartContainer: {
    marginVertical: 20,
  },
  statsContainer: {
    marginTop: 20,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 100,
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
    textAlign: 'center',
  },
  statText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#475569',
    marginLeft: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
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
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  detailsButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748b',
    marginRight: 4,
  },
  detailsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  detailsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#334155',
    marginBottom: 16,
  },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  voterName: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#334155',
  },
  voteOptionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  voteOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#334155',
  },
  voteCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    width: 60,
    textAlign: 'right',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});