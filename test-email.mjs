import nodemailer from 'nodemailer';

async function testEmail() {
    console.log("Iniciando prueba de envio...");
    const smtpHost = 'smtp.mi.com.co';
    const smtpPort = 465;
    const smtpUser = 'pedidos@gorodadero.co';
    const smtpPass = 'Ji070724.';

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
    });

    try {
        const info = await transporter.sendMail({
            from: `"GoRodadero Test 🛵" <${smtpUser}>`,
            to: 'jahck2@gmail.com',
            subject: `🛍️ Prueba de envio local GoRodadero`,
            html: `<h1>Prueba exitosa SMTP</h1><p>Las credenciales funcionan.</p>`
        });
        console.log("Correo enviado con exito!", info.messageId);
    } catch (err) {
        console.error("Error enviando correo:", err);
    }
}

testEmail();
