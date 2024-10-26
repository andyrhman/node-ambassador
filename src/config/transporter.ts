import { createTransport } from "nodemailer";

const transporter = createTransport({
    // service: "gmail",
    // host: "smtp.gmail.com",
    // port: 465,
    // secure: true,
    // auth: {
    //     user: process.env.GMAIL_EMAIL,
    //     pass: process.env.GMAIL_PASSWORD,
    // },
    host: 'host.docker.internal',
    port: 1025
});

export default transporter;