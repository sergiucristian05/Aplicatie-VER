import emailjs from "@emailjs/browser";

export function trimiteEmailNotificare({ marca, numar, expirari }) {
  const params = {
    marca,
    numar,
    expirari,
  };

  return emailjs.send(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    params,
    process.env.NEXT_PUBLIC_EMAILJS_USER_ID
  )
  .then((response) => {
    console.log("Email trimis cu succes:", response.status, response.text);
  })
  .catch((error) => {
    console.error("Eroare la trimiterea emailului:", error);
  });
}
