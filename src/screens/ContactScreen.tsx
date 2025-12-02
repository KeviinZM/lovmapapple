import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import emailjs from '@emailjs/browser';

interface ContactScreenProps {
  onGoBack: () => void;
}

export const ContactScreen: React.FC<ContactScreenProps> = ({ onGoBack }) => {
  const { t, language } = useLanguage();
  const isFrench = language === 'fr';
  const [isLoading, setIsLoading] = useState(false);

  // Configuration Email.js avec vos clés
  const EMAILJS_CONFIG = {
    PUBLIC_KEY: '8VBJgRBaOW5dmzbij',
    SERVICE_ID: 'service_4u0fo02',
    TEMPLATE_ID: 'template_7727xxo',
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const contactContent = {
    fr: {
      title: 'Contact',
      subtitle: 'Nous sommes là pour vous aider !',
      description: 'Envoyez-nous un message et nous vous répondrons dans les plus brefs délais.',
      
      form: {
        name: 'Nom complet *',
        email: 'Email *',
        subject: 'Sujet *',
        message: 'Message *',
        send: 'Envoyer le message',
        sending: 'Envoi en cours...',
        placeholder: {
          name: 'Votre nom complet',
          email: 'votre.email@exemple.com',
          subject: 'Sujet de votre message',
          message: 'Décrivez votre question ou problème...',
        }
      },
      
                   info: {
               title: 'Informations de contact',
               email: 'Email principal',
               emailValue: 'contact@lovmap.fr',
               response: 'Temps de réponse',
               responseValue: 'Sous 48h ouvrées',
               support: 'Support technique',
               supportValue: 'Disponible 7j/7'
             },
      
      topics: {
        title: 'Sujets fréquents',
        technical: '• Problème technique',
        feature: '• Demande de fonctionnalité',
        bug: '• Signalement de bug',
        account: '• Problème de compte',
        privacy: '• Question sur la confidentialité',
        other: '• Autre'
      },
      
      success: 'Message envoyé avec succès !',
      error: 'Erreur lors de l\'envoi. Veuillez réessayer.',
      required: 'Tous les champs sont obligatoires.',
      invalidEmail: 'Veuillez entrer une adresse email valide.'
    },
    
    en: {
      title: 'Contact',
      subtitle: 'We are here to help you!',
      description: 'Send us a message and we will get back to you as soon as possible.',
      
      form: {
        name: 'Full name *',
        email: 'Email *',
        subject: 'Subject *',
        message: 'Message *',
        send: 'Send message',
        sending: 'Sending...',
        placeholder: {
          name: 'Your full name',
          email: 'your.email@example.com',
          subject: 'Subject of your message',
          message: 'Describe your question or issue...',
        }
      },
      
                   info: {
               title: 'Contact information',
               email: 'Main email',
               emailValue: 'contact@lovmap.fr',
               response: 'Response time',
               responseValue: 'Within 48 business hours',
               support: 'Technical support',
               supportValue: 'Available 7 days/week'
             },
      
      topics: {
        title: 'Frequent topics',
        technical: '• Technical issue',
        feature: '• Feature request',
        bug: '• Bug report',
        account: '• Account problem',
        privacy: '• Privacy question',
        other: '• Other'
      },
      
      success: 'Message sent successfully!',
      error: 'Error sending message. Please try again.',
      required: 'All fields are required.',
      invalidEmail: 'Please enter a valid email address.'
    }
  };

  const content = contactContent[isFrench ? 'fr' : 'en'];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      Alert.alert('Erreur', content.required);
      return false;
    }
    
    if (!validateEmail(formData.email)) {
      Alert.alert('Erreur', content.invalidEmail);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
             const templateParams = {
         from_name: formData.name,
         from_email: formData.email,
         subject: formData.subject,
         message: formData.message,
         to_email: 'contact@lovmap.fr',
       };

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      Alert.alert('Succès', content.success);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
    } catch (error) {
      console.error('Email.js error:', error);
      Alert.alert('Erreur', content.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{content.title}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.subtitle}>{content.subtitle}</Text>
          <Text style={styles.description}>{content.description}</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>{content.form.name}</Text>
          <TextInput
            style={styles.input}
            placeholder={content.form.placeholder.name}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholderTextColor="#999"
          />

          <Text style={styles.sectionTitle}>{content.form.email}</Text>
          <TextInput
            style={styles.input}
            placeholder={content.form.placeholder.email}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          <Text style={styles.sectionTitle}>{content.form.subject}</Text>
          <TextInput
            style={styles.input}
            placeholder={content.form.placeholder.subject}
            value={formData.subject}
            onChangeText={(text) => setFormData({ ...formData, subject: text })}
            placeholderTextColor="#999"
          />

          <Text style={styles.sectionTitle}>{content.form.message}</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder={content.form.placeholder.message}
            value={formData.message}
            onChangeText={(text) => setFormData({ ...formData, message: text })}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>{content.form.send}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{content.info.title}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{content.info.email}:</Text>
            <Text style={styles.infoValue}>{content.info.emailValue}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{content.info.response}:</Text>
            <Text style={styles.infoValue}>{content.info.responseValue}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{content.info.support}:</Text>
            <Text style={styles.infoValue}>{content.info.supportValue}</Text>
          </View>
        </View>

        <View style={styles.topicsSection}>
          <Text style={styles.sectionTitle}>{content.topics.title}</Text>
          <Text style={styles.topicText}>{content.topics.technical}</Text>
          <Text style={styles.topicText}>{content.topics.feature}</Text>
          <Text style={styles.topicText}>{content.topics.bug}</Text>
          <Text style={styles.topicText}>{content.topics.account}</Text>
          <Text style={styles.topicText}>{content.topics.privacy}</Text>
          <Text style={styles.topicText}>{content.topics.other}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FF6A2B',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  introSection: {
    marginVertical: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  formSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  messageInput: {
    height: 120,
    paddingTop: 16,
  },
  sendButton: {
    backgroundColor: '#FF6A2B',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    marginVertical: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  topicsSection: {
    marginVertical: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  topicText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
    lineHeight: 20,
  },
});

export default ContactScreen;
