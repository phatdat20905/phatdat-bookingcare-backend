require('dotenv').config();
import nodemailer from 'nodemailer'

let sendSimpleEmail = async (dataSend) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
          user: process.env.EMAIL_APP,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    let info = await transporter.sendMail({
        from: '"Phát Đạt bookingcare 👻" <ngophatdat2k5@gmail.com>', // sender address
        to: dataSend.receiverEmail, // list of receivers
        subject: "Thông tin đặt lịch khám bệnh", // Subject line
        html: getBodyHTMLEmail(dataSend)
    });
}

let getBodyHTMLEmail = (dataSend) => {
    let result = '';
    if(dataSend.language === 'vi'){
        result = `
        <h3>Xin chào ${dataSend.patientName}</h3>
        <p>Chúng tôi đã nhận được yêu cầu đặt lịch khám bệnh từ bạn. Vui lòng kiểm tra email để xác nhận thông tin.</p>
        <p>Thông tin chi tiết của bạn:</p>
        <div><b>Thời gian: ${dataSend.time}</b></div>
        <div><b>Bác sĩ: ${dataSend.doctorName}</b></div>

        <p>Nếu các thông tin trên là đúng sự thật, vui lòng click vào đường link bên dưới
            để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh.
        </p>
        <div>
            <a href="${dataSend.redirecLink}" target="_blank">Xác nhận thông tin</a>
        </div>
        <p>Cảm ơn bạn đã sử dụng dịch vụ của bookingcare.</p>
        `
    }

    if(dataSend.language === 'en'){
        result = `
        <h3>Dear ${dataSend.patientName}</h3>
        <p>We have received your request to schedule a medical examination. Please check your email to confirm information.</p>
        <p>Your details:</p>
        <div><b>Time ${dataSend.time}</b></div>
        <div><b>Doctor: ${dataSend.doctorName}</b></div>

        <p>If the above information is true, please click on the link below
            to confirm and complete the medical appointment booking procedure.
        </p>
        <div>
            <a href="${dataSend.redirecLink}" target="_blank">Xác nhận thông tin</a>
        </div>
        <p>Thank you for using bookingcare's services.</p>
        `
    }
    return result;
}

let getBodyHTMLEmailRemedy = (dataSend) => {
    let result = '';
    if(dataSend.language === 'vi'){
        result = `
        <h3>Xin chào ${dataSend.patientName}</h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên bookingcare</p>
        <p>Thông tin đơn thuốc/hóa đơn được gửi trong file đính kèm.</p>
        <div>Xin chân thành cảm ơn</div>
        `
    }
    if(dataSend.language === 'en'){
        result = `
        <h3>Dear ${dataSend.patientName}</h3>
        <p>You have received this email because you have scheduled a medical examination online at bookingcare</p>
        <p>The prescription/medication order has been attached in the file.</p>
        <div>Thank you for your understanding</div>
        `
    }
    return result;
}

let sendAttachment = async (dataSend) => {
    return new Promise(async (resolve, reject) => {
        try {
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // true for port 465, false for other ports
                auth: {
                  user: process.env.EMAIL_APP,
                  pass: process.env.EMAIL_APP_PASSWORD,
                },
            });
            let info = await transporter.sendMail({
                from: '"Phát Đạt bookingcare 👻" <ngophatdat2k5@gmail.com>', // sender address
                to: dataSend.email, // list of receivers
                subject: "Kết quả đặt lịch khám bệnh", // Subject line
                html: getBodyHTMLEmailRemedy(dataSend),
                attachments: [
                    {
                        filename:  `remedy-${dataSend.patientId}-${new Date().getTime()}.png`,
                        content: dataSend.imageBase64.split("base64,")[1],
                        encoding: 'base64'
                    }
                ]
            });
            resolve(true);
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    sendSimpleEmail, sendAttachment
}