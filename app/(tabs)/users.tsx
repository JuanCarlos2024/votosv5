import { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AuthContext } from 'context/AuthContext';
import { DataContext } from 'context/DataContext';
import { Users, UserPlus, Edit, Trash2, TriangleAlert } from 'lucide-react-native';

export default function UsersScreen() {
  const { user } = useContext(AuthContext);
  const { users, addUser, updateUser, deleteUser } = useContext(DataContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    id_usuario: '',
    contraseña: '',
    votos_disponibles: '',
  });

  if (user?.rol !== 'administrador') {
    return (
      <View style={styles.unauthorizedContainer}>
        <TriangleAlert size={48} color="#ef4444" />
        <Text style={styles.unauthorizedText}>No tienes acceso a esta sección</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!formData.nombre_usuario || !formData.id_usuario || !formData.contraseña || !formData.votos_disponibles) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    try {
      if (editingUser) {
        await updateUser(formData);
        Alert.alert('Éxito', 'Usuario actualizado correctamente');
      } else {
        await addUser(formData);
        Alert.alert('Éxito', 'Usuario creado correctamente');
      }
      setModalVisible(false);
      setEditingUser(null);
      setFormData({
        nombre_usuario: '',
        id_usuario: '',
        contraseña: '',
        votos_disponibles: '',
      });
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar el usuario');
    }
  };

  const handleDelete = (userId) => {
    Alert.alert(
      'Eliminar Usuario',
      '¿Estás seguro que deseas eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(userId);
              Alert.alert('Éxito', 'Usuario eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'Ocurrió un error al eliminar el usuario');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingUser(null);
            setFormData({
              nombre_usuario: '',
              id_usuario: '',
              contraseña: '',
              votos_disponibles: '',
            });
            setModalVisible(true);
          }}
        >
          <UserPlus size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Nuevo Usuario</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {users.map((user) => (
          <View key={user.id_usuario} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Users size={24} color="#2563eb" style={styles.userIcon} />
              <View>
                <Text style={styles.userName}>{user.nombre_usuario}</Text>
                <Text style={styles.userId}>ID: {user.id_usuario}</Text>
                <Text style={styles.userVotes}>
                  Votos disponibles: {user.votos_disponibles}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setEditingUser(user);
                  setFormData({
                    ...user,
                    votos_disponibles: user.votos_disponibles.toString(),
                  });
                  setModalVisible(true);
                }}
              >
                <Edit size={20} color="#2563eb" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(user.id_usuario)}
              >
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {modalVisible && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre de usuario"
              value={formData.nombre_usuario}
              onChangeText={(text) =>
                setFormData({ ...formData, nombre_usuario: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="ID de usuario"
              value={formData.id_usuario}
              onChangeText={(text) =>
                setFormData({ ...formData, id_usuario: text })
              }
              editable={!editingUser}
            />

            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={formData.contraseña}
              onChangeText={(text) =>
                setFormData({ ...formData, contraseña: text })
              }
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Votos disponibles"
              value={formData.votos_disponibles}
              onChangeText={(text) =>
                setFormData({ ...formData, votos_disponibles: text })
              }
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setEditingUser(null);
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
      )}
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
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userIcon: {
    marginRight: 12,
  },
  userName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  userId: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  userVotes: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#2563eb',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
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