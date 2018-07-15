document.addEventListener("DOMContentLoaded", () => {
  /* Crop profile image */
  const resizerWrp = document.getElementById('resizer-wrp');
  const fileInput = document.getElementById('picture');
  const signupForm = document.getElementById("signupForm");

  fileInput.onchange = () => {
    readFile(fileInput);
  };

  const croppie = new Croppie(resizerWrp, {
    viewport: {
      width: 200,
      height: 200,
      type: "circle"
    },
    boundary: {
      width: 220,
      height: 220
    },
    mouseWheelZoom: false
  });

  const readFile = input => {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
  
      reader.onload = e => {
        resizerWrp.classList.remove("d-none");
        croppie.bind({
            url: e.target.result
          })
          .then(() => {
            console.log("Bind complete");
          });
      };
  
      reader.readAsDataURL(input.files[0]);
    }
  };

  signupForm.onsubmit = () => {
    croppie.result({
        type: "base64"
      })
      .then(resp => {
        document.getElementById("profilePic").value = resp;
        signupForm.submit();
      });
    
    return false;
  }
}, false);
