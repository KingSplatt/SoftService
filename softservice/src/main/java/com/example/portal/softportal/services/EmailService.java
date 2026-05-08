package com.example.portal.softportal.services;

import com.example.portal.softportal.models.Solicitud;
import com.example.portal.softportal.models.Usuario;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private final JavaMailSender javaMailSender;

    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void enviarConfirmacionNuevaSolicitud(Usuario usuario, Solicitud solicitud) {
        try {
            MimeMessage mensaje = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            String asunto = "Confirmación de Nueva Solicitud de Permiso";
            String cuerpoHtml = generarCuerpoNuevaSolicitud(usuario, solicitud);

            helper.setTo(usuario.getEmail());
            helper.setSubject(asunto);
            helper.setText(cuerpoHtml, true);
            helper.setFrom("miguelpruebalopezprueba@gmail.com");

            javaMailSender.send(mensaje);
            System.out.println("Email de confirmación enviado a: " + usuario.getEmail());
        } catch (MessagingException e) {
            System.err.println("Error al construir el mensaje de confirmación: " + e.getMessage());
            e.printStackTrace();
        } catch (MailException e) {
            System.err.println("Error SMTP al enviar email de confirmación: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void enviarNotificacionCambioEstado(Usuario usuario, Solicitud solicitud, String motivo) {
        try {
            MimeMessage mensaje = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            String asunto = "Cambio de Estado en tu Solicitud de Permiso";
            String cuerpoHtml = generarCuerpoCambioEstado(usuario, solicitud, motivo);

            helper.setTo(usuario.getEmail());
            helper.setSubject(asunto);
            helper.setText(cuerpoHtml, true);
            helper.setFrom("miguelpruebalopezprueba@gmail.com");

            javaMailSender.send(mensaje);
            System.out.println("Email de cambio de estado enviado a: " + usuario.getEmail());
        } catch (MessagingException e) {
            System.err.println("Error al construir el mensaje de cambio de estado: " + e.getMessage());
            e.printStackTrace();
        } catch (MailException e) {
            System.err.println("Error SMTP al enviar email de cambio de estado: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void enviarCorreoPrueba(String destinatario) {
        try {
            MimeMessage mensaje = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setTo(destinatario);
            helper.setSubject("Prueba de envío de correo - SoftPortal");
            helper.setText(generarCuerpoCorreoPrueba(destinatario), true);
            helper.setFrom("miguelpruebalopezprueba@gmail.com");

            javaMailSender.send(mensaje);
            System.out.println("Email de prueba enviado a: " + destinatario);
        } catch (MessagingException e) {
            throw new IllegalStateException("Error al construir el correo de prueba: " + e.getMessage(), e);
        } catch (MailException e) {
            throw new IllegalStateException("Error SMTP al enviar el correo de prueba: " + e.getMessage(), e);
        }
    }

    private String generarCuerpoCorreoPrueba(String destinatario) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }");
        html.append(".header { background-color: #2563eb; color: white; padding: 15px; border-radius: 5px; text-align: center; margin-bottom: 20px; }");
        html.append(".content { margin: 20px 0; }");
        html.append(".field { margin: 10px 0; }");
        html.append(".label { font-weight: bold; color: #555; }");
        html.append(".footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }");
        html.append("</style></head><body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\"><h2>Prueba de envío de correo</h2></div>");
        html.append("<div class=\"content\">");
        html.append("<p>Este es un correo de prueba enviado desde SoftPortal.</p>");
        html.append("<div class=\"field\"><span class=\"label\">Destinatario:</span> ").append(destinatario).append("</div>");
        html.append("<div class=\"field\"><span class=\"label\">Estado:</span> Envío SMTP ejecutado correctamente si recibes este mensaje.</div>");
        html.append("</div>");
        html.append("<div class=\"footer\">");
        html.append("<p>Mensaje generado automáticamente para validar la configuración de correo.</p>");
        html.append("</div>");
        html.append("</div></body></html>");
        return html.toString();
    }

    private String generarCuerpoNuevaSolicitud(Usuario usuario, Solicitud solicitud) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }");
        html.append(".header { background-color: #4CAF50; color: white; padding: 15px; border-radius: 5px; text-align: center; margin-bottom: 20px; }");
        html.append(".content { margin: 20px 0; }");
        html.append(".field { margin: 10px 0; }");
        html.append(".label { font-weight: bold; color: #555; }");
        html.append(".footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }");
        html.append("</style></head><body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\"><h2>Confirmación de Nueva Solicitud</h2></div>");
        html.append("<div class=\"content\">");
        html.append("<p>Estimado ").append(usuario.getNombreUsuario()).append(",</p>");
        html.append("<p>Tu solicitud de permiso ha sido registrada correctamente en el sistema.</p>");
        html.append("<div class=\"field\">");
        html.append("<span class=\"label\">Tipo de Permiso:</span> ").append(solicitud.getTipoPermiso().getNombre()).append("</div>");
        html.append("<div class=\"field\">");
        html.append("<span class=\"label\">Fecha de Inicio:</span> ").append(solicitud.getFechaInicio().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("</div>");
        html.append("<div class=\"field\">");
        html.append("<span class=\"label\">Fecha de Fin:</span> ").append(solicitud.getFechaFin().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("</div>");
        html.append("<div class=\"field\">");
        html.append("<span class=\"label\">Estado:</span> <strong>").append(solicitud.getEstadoSolicitud().getNombre()).append("</strong></div>");
        html.append("</div>");
        html.append("<div class=\"footer\">");
        html.append("<p>Este es un correo automático, por favor no respondas a este mensaje.</p>");
        html.append("</div>");
        html.append("</div></body></html>");
        return html.toString();
    }

    private String generarCuerpoCambioEstado(Usuario usuario, Solicitud solicitud, String motivo) {
        String colorEstado = getColorPorEstado(solicitud.getEstadoSolicitud().getNombre());
        
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }");
        html.append(".header { background-color: ").append(colorEstado).append("; color: white; padding: 15px; border-radius: 5px; text-align: center; margin-bottom: 20px; }");
        html.append(".content { margin: 20px 0; }");
        html.append(".field { margin: 10px 0; }");
        html.append(".label { font-weight: bold; color: #555; }");
        html.append(".status-badge { display: inline-block; padding: 5px 10px; background-color: ").append(colorEstado).append("; color: white; border-radius: 3px; font-weight: bold; }");
        html.append(".motivo-box { background-color: #f5f5f5; padding: 10px; border-left: 4px solid ").append(colorEstado).append("; margin: 15px 0; }");
        html.append(".footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }");
        html.append("</style></head><body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\"><h2>Estado de tu Solicitud Actualizado</h2></div>");
        html.append("<div class=\"content\">");
        html.append("<p>Estimado ").append(usuario.getNombreUsuario()).append(",</p>");
        html.append("<p>El estado de tu solicitud de permiso ha sido actualizado.</p>");
        html.append("<div class=\"field\">");
        html.append("<span class=\"label\">Nuevo Estado:</span> <span class=\"status-badge\">").append(solicitud.getEstadoSolicitud().getNombre().toUpperCase()).append("</span></div>");
        html.append("<div class=\"field\">");
        html.append("<span class=\"label\">Tipo de Permiso:</span> ").append(solicitud.getTipoPermiso().getNombre()).append("</div>");
        html.append("<div class=\"field\">");
        html.append("<span class=\"label\">Fecha de Inicio:</span> ").append(solicitud.getFechaInicio().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("</div>");
        html.append("<div class=\"field\">");
        html.append("<span class=\"label\">Fecha de Fin:</span> ").append(solicitud.getFechaFin().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("</div>");
        
        if (motivo != null && !motivo.trim().isEmpty()) {
            html.append("<div class=\"motivo-box\">");
            html.append("<span class=\"label\">Comentario:</span><br>");
            html.append(motivo);
            html.append("</div>");
        }
        
        html.append("</div>");
        html.append("<div class=\"footer\">");
        html.append("<p>Este es un correo automático, por favor no respondas a este mensaje.</p>");
        html.append("</div>");
        html.append("</div></body></html>");
        return html.toString();
    }

    private String getColorPorEstado(String estado) {
        if (estado == null) return "#999999";
        
        return switch(estado.toLowerCase()) {
            case "aceptado", "aprobado" -> "#10b981";
            case "rechazado" -> "#ef4444";
            case "pendiente" -> "#f59e0b";
            default -> "#6b7280";
        };
    }
}
