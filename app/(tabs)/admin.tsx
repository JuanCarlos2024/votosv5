import { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { DataContext } from 'context/DataContext';
import { AuthContext } from 'context/AuthContext';
import { useRouter } from 'expo-router';
import { CirclePlus, CreditCard as Edit, Circle as XCircle, Eye, Check, TriangleAlert } from 'lucide-react-native';
import { exportToCSV, exportToPDF } from 'utils/exportUtils';

export default function AdminScreen() {
  const { user } = useContext(AuthContext);
  const { questions, loadQuestions, addQuestion, updateQuestion, deleteQuestion, approveByUnanimity } = useContext(DataContext);
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleSave = async () => {
    if (!questionText.trim()) {
      Alert.alert("Error", "La pregunta no puede estar vacía");
      return;
    }
    if (editingQuestion) {
      await updateQuestion({ ...editingQuestion, texto_pregunta: questionText });
    } else {
      await addQuestion({ texto_pregunta: questionText, estado: 'activa', fecha_creacion: new Date().toISOString() });
    }
    setModalVisible(false);
    setEditingQuestion(null);
    setQuestionText('');
  };

  const handleDelete = (q) => {
    Alert.alert(
      "Eliminar Pregunta",
      "¿Estás seguro que deseas eliminar esta pregunta?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => await deleteQuestion(q.id_pregunta) 
        },
      ]
    );
  };

  const handleClose = (q) => {
    Alert.alert(
      "Cerrar Votación",
      "¿Estás seguro que deseas cerrar esta votación?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Cerrar", 
          onPress: async () => {
            await updateQuestion({ 
              ...q, 
              estado: 'cerrada', 
              fecha_cierre: new Date().toISOString() 
            });
          }
        },
      ]
    );
  };

  const handleUnanimous = (q) => {
    Alert.alert(
      "Aprobar por Unanimidad",
      "¿Estás seguro que deseas aprobar esta pregunta por unanimidad?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Aprobar", 
          onPress: async () => {
            await approveByUnanimity(q.id_pregunta);
            Alert.alert("Éxito", "La pregunta ha sido aprobada por unanimidad");
          }
        },
      ]
    );
  };

  const handleExport = async (q) => {
    try {
      await exportToCSV(q.votos || []);
      Alert.alert("Éxito", "Los datos han sido exportados correctamente");
    } catch (error) {
      Alert.alert("Error", "No se pudieron exportar los datos");
    }
  };

  if (user?.rol !== 'administrador') {
    return (
      <View style={styles.unauthorizedContainer}>
        <TriangleAlert size={48} color="#ef4444" />
        <Text style={styles.unauthorizedText}>No tienes acceso a esta sección</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Administración</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            setModalVisible(true);
            setEditingQuestion(null);
            setQuestionText('');
          }}
        >
          <CirclePlus size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Nueva Pregunta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {questions.map((question) => (
          <View key={question.id_pregunta} style={styles.questionCard}>
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
                  styles.statusText,
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

            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  setEditingQuestion(question);
                  setQuestionText(question.texto_pregunta);
                  setModalVisible(true);
                }}
              >
                <Edit size={20} color="#2563eb" />
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(question)}
              >
                <XCircle size={20} color="#ef4444" />
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                  Eliminar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push(`/results/${question.id_pregunta}`)}
              >
                <Eye size={20} color="#2563eb" />
                <Text style={styles.actionButtonText}>Ver</Text>
              </TouchableOpacity>

              {question.estado === 'activa' && (
                <>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.closeButton]}
                    onPress={() => handleClose(question)}
                  >
                    <XCircle size={20} color="#64748b" />
                    <Text style={[styles.actionButtonText, styles.closeButtonText]}>
                      Cerrar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.unanimousButton]}
                    onPress={() => handleUnanimous(question)}
                  >
                    <Check size={20} color="#059669" />
                    <Text style={[styles.actionButtonText, styles.unanimousButtonText]}>
                      Unanimidad
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity 
                style={[styles.actionButton, styles.exportButton]}
                onPress={() => handleExport(question)}
              >
                <Text style={[styles.actionButtonText, styles.exportButtonText]}>
                  CSV
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingQuestion ? "Editar Pregunta" : "Nueva Pregunta"}
            </Text>

            <TextInput
              style={styles.input}
              value={questionText}
              onChangeText={setQuestionText}
              placeholder="Escribe la pregunta..."
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setEditingQuestion(null);
                  setQuestionText('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unauthorizedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#ef4444',
    marginTop: 16,
    textAlign: 'center',
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
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  statusText: {
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
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#2563eb',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  closeButton: {
    backgroundColor: '#f1f5f9',
  },
  closeButtonText: {
    color: '#64748b',
  },
  unanimousButton: {
    backgroundColor: '#f0fdf4',
  },
  unanimousButtonText: {
    color: '#059669',
  },
  exportButton: {
    backgroundColor: '#f8fafc',
  },
  exportButtonText: {
    color: '#475569',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#64748b',
  },
  saveButton: {
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#ffffff',
  },
});