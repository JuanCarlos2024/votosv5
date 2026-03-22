import { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from 'context/AuthContext';

import { LogOut, CircleUser as UserCircle, Vote, Info, Shield, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar la sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <UserCircle size={80} color="#2563eb" />
        </View>
        
        <Text style={styles.userName}>{user?.nombre_usuario}</Text>
        <Text style={styles.userRole}>
          {user?.rol === 'administrador' ? 'Administrador' : 'Usuario'}
        </Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>ID de Usuario</Text>
            <Text style={styles.infoValue}>{user?.id_usuario}</Text>
          </View>
          
          {user?.rol !== 'administrador' && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Votos Disponibles</Text>
              <View style={styles.voteCountContainer}>
                <Text style={styles.voteCount}>{user?.votos_disponibles || 0}</Text>
                <Vote size={16} color="#2563eb" />
              </View>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Información de la Aplicación</Text>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Info size={24} color="#2563eb" />
            <Text style={styles.cardTitle}>Sobre el Sistema de Votación</Text>
          </View>
          
          <Text style={styles.cardText}>
            Esta aplicación permite realizar votaciones internas de manera segura y transparente. 
            Cada usuario tiene asignado un número específico de votos que puede utilizar para 
            expresar su opinión en las diferentes consultas.
          </Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Shield size={24} color="#2563eb" />
            <Text style={styles.cardTitle}>Reglas de Votación</Text>
          </View>
          
          <View style={styles.ruleItem}>
            <CheckCircle size={18} color="#10b981" style={styles.ruleIcon} />
            <Text style={styles.ruleText}>
              Solo puedes votar una vez por cada pregunta.
            </Text>
          </View>
          
          <View style={styles.ruleItem}>
            <CheckCircle size={18} color="#10b981" style={styles.ruleIcon} />
            <Text style={styles.ruleText}>
              Tus votos disponibles se aplican por completo a la opción elegida.
            </Text>
          </View>
          
          <View style={styles.ruleItem}>
            <AlertCircle size={18} color="#f59e0b" style={styles.ruleIcon} />
            <Text style={styles.ruleText}>
              No podrás votar si no tienes votos disponibles.
            </Text>
          </View>
          
          <View style={styles.ruleItem}>
            <AlertCircle size={18} color="#f59e0b" style={styles.ruleIcon} />
            <Text style={styles.ruleText}>
              Una vez cerrada la votación, no se pueden modificar los votos.
            </Text>
          </View>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Vote size={24} color="#2563eb" />
            <Text style={styles.cardTitle}>Opciones de Voto</Text>
          </View>
          
          <View style={styles.optionItem}>
            <View style={[styles.optionBadge, styles.approveOptionBadge]}>
              <Text style={styles.optionBadgeText}>Apruebo</Text>
            </View>
            <Text style={styles.optionText}>
              Indica que estás de acuerdo con la propuesta presentada.
            </Text>
          </View>
          
          <View style={styles.optionItem}>
            <View style={[styles.optionBadge, styles.rejectOptionBadge]}>
              <Text style={styles.optionBadgeText}>Rechazo</Text>
            </View>
            <Text style={styles.optionText}>
              Indica que no estás de acuerdo con la propuesta presentada.
            </Text>
          </View>
          
          <View style={styles.optionItem}>
            <View style={[styles.optionBadge, styles.abstainOptionBadge]}>
              <Text style={styles.optionBadgeText}>Me abstengo</Text>
            </View>
            <Text style={styles.optionText}>
              Indicas que prefieres no tomar posición a favor o en contra.
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
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
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarContainer: {
    backgroundColor: '#e0f2fe',
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#1e293b',
    marginBottom: 6,
  },
  userRole: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '90%',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
  },
  infoValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#334155',
  },
  voteCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteCount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#334155',
    marginRight: 6,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginVertical: 16,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#334155',
    marginLeft: 8,
  },
  cardText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ruleIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  ruleText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#475569',
    flex: 1,
  },
  optionItem: {
    marginBottom: 12,
  },
  optionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
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
  },
  optionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#475569',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 32,
    marginTop: 8,
  },
  logoutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 8,
  },
});