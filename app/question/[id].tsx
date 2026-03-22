import { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DataContext } from 'context/DataContext';
import { AuthContext } from 'context/AuthContext';
import { ArrowLeft, ThumbsUp, ThumbsDown, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function QuestionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, updateUserVotes } = useContext(AuthContext);
  const { getQuestionById, voteOnQuestion } = useContext(DataContext);
  
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const loadQuestion = async () => {
      const questionData = await getQuestionById(id);
      setQuestion(questionData);
      setLoading(false);
    };
    
    loadQuestion();
  }, [id]);
  
  const hasVoted = question?.votos?.some((voto: any) => voto.id_usuario === user?.id_usuario);
  const hasAvailableVotes = user?.votos_disponibles && user.votos_disponibles > 0;
  
  const handleVote = async () => {
    if (!selectedOption) {
      Alert.alert('Error', 'Debes seleccionar una opción para votar');
      return;
    }
    
    if (!hasAvailableVotes) {
      Alert.alert('Error', 'No tienes votos disponibles');
      return;
    }

    Alert.alert(
      'Confirmar Voto',
      `¿Estás seguro que deseas votar "${selectedOption === 'apruebo' ? 'Apruebo' : 
        selectedOption === 'rechazo' ? 'Rechazo' : 'Me abstengo'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setSubmitting(true);
            try {
              await voteOnQuestion(id, {
                id_usuario: user?.id_usuario,
                nombre_usuario: user?.nombre_usuario,
                opcion: selectedOption,
                cantidad_votos: user?.votos_disponibles || 0,
                timestamp: new Date().toISOString(),
              });
              updateUserVotes(0);
              
              Alert.alert(
                'Voto Registrado',
                'Tu voto ha sido registrado exitosamente.',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)/questions') }]
              );
            } catch (error) {
              Alert.alert('Error', 'Ocurrió un error al registrar tu voto');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };
  
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
  
  if (hasVoted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backIcon}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Votación</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.questionText}>{question.texto_pregunta}</Text>
          
          <View style={styles.alreadyVotedContainer}>
            <AlertTriangle size={48} color="#f59e0b" />
            <Text style={styles.alreadyVotedText}>
              Ya has votado en esta pregunta.
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  if (question.estado === 'cerrada') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backIcon}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Votación</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.questionText}>{question.texto_pregunta}</Text>
          
          <View style={styles.alreadyVotedContainer}>
            <AlertTriangle size={48} color="#f59e0b" />
            <Text style={styles.alreadyVotedText}>
              Esta votación está cerrada.
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backIcon}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Votar</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.questionText}>{question.texto_pregunta}</Text>
        
        <View style={styles.votesAvailableContainer}>
          <Text style={styles.votesAvailableLabel}>Votos disponibles:</Text>
          <Text style={styles.votesAvailableCount}>{user?.votos_disponibles || 0}</Text>
        </View>
        
        <Text style={styles.chooseOptionText}>Selecciona una opción:</Text>
        
        <TouchableOpacity 
          style={[
            styles.optionButton, 
            styles.approveButton,
            selectedOption === 'apruebo' && styles.selectedOption
          ]}
          onPress={() => setSelectedOption('apruebo')}
          disabled={!hasAvailableVotes}
        >
          <ThumbsUp 
            size={24} 
            color={selectedOption === 'apruebo' ? '#ffffff' : '#10b981'} 
          />
          <Text style={[
            styles.optionText, 
            styles.approveText,
            selectedOption === 'apruebo' && styles.selectedOptionText
          ]}>
            Apruebo
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.optionButton, 
            styles.rejectButton,
            selectedOption === 'rechazo' && styles.selectedRejectOption
          ]}
          onPress={() => setSelectedOption('rechazo')}
          disabled={!hasAvailableVotes}
        >
          <ThumbsDown 
            size={24} 
            color={selectedOption === 'rechazo' ? '#ffffff' : '#ef4444'} 
          />
          <Text style={[
            styles.optionText, 
            styles.rejectText,
            selectedOption === 'rechazo' && styles.selectedOptionText
          ]}>
            Rechazo
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.optionButton, 
            styles.abstainButton,
            selectedOption === 'abstengo' && styles.selectedAbstainOption
          ]}
          onPress={() => setSelectedOption('abstengo')}
          disabled={!hasAvailableVotes}
        >
          <AlertTriangle 
            size={24} 
            color={selectedOption === 'abstengo' ? '#ffffff' : '#64748b'} 
          />
          <Text style={[
            styles.optionText, 
            styles.abstainText,
            selectedOption === 'abstengo' && styles.selectedOptionText
          ]}>
            Me abstengo
          </Text>
        </TouchableOpacity>
        
        {!hasAvailableVotes && (
          <View style={styles.noVotesWarning}>
            <AlertTriangle size={20} color="#f59e0b" />
            <Text style={styles.noVotesText}>
              No tienes votos disponibles para participar.
            </Text>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!selectedOption || !hasAvailableVotes) && styles.disabledButton
            ]}
            onPress={handleVote}
            disabled={!selectedOption || submitting || !hasAvailableVotes}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Votar</Text>
            )}
          </TouchableOpacity>
        </View>
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
  questionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 24,
    lineHeight: 28,
  },
  votesAvailableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  votesAvailableLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#475569',
    marginRight: 6,
  },
  votesAvailableCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#2563eb',
  },
  chooseOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#475569',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
  },
  approveButton: {
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
  },
  rejectButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
  },
  abstainButton: {
    backgroundColor: '#f8fafc',
    borderColor: '#f1f5f9',
  },
  selectedOption: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  selectedRejectOption: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  selectedAbstainOption: {
    backgroundColor: '#64748b',
    borderColor: '#64748b',
  },
  optionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginLeft: 10,
  },
  approveText: {
    color: '#10b981',
  },
  rejectText: {
    color: '#ef4444',
  },
  abstainText: {
    color: '#64748b',
  },
  selectedOptionText: {
    color: '#ffffff',
  },
  noVotesWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  noVotesText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#c2410c',
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#64748b',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  alreadyVotedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 24,
    marginVertical: 24,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  alreadyVotedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#c2410c',
    textAlign: 'center',
    marginTop: 16,
  },
  backButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#475569',
  },
});