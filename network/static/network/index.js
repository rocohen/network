const newPost_btn = document.querySelector('#new-post');

if (newPost_btn !== null) {
  
  newPost_btn.addEventListener('keyup', displayPostLength)
  
  function displayPostLength(event) {
    const postBody = document.querySelector('#new-post').value;
    document.querySelector('.postLength').innerText = postBody.length;
  
    if (postBody.length > 200) {   
      if (event.keyCode == 46 || event.keyCode == 8) {
        event.returnValue = true;
      } else {
        document.querySelector('.post-btn').disabled = true;
        event.returnValue = false
      }
    } else {
      document.querySelector('.post-btn').disabled = false;
    }
  
  }
}


const form = document.querySelectorAll('.like-form');

form.forEach(form => {
  form.onsubmit = function(e) {
    e.preventDefault()
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const url = this.getAttribute('action');
    const post_id = this.dataset.post_id
    const like_btn = document.querySelectorAll(`#like-btn-${post_id}`)
    const like_icon = document.querySelector(`.is_liked-${post_id}`)
    const likes_count = document.querySelector(`.likes_count_${post_id}`)
    
    // Number of likes
    let likes = document.querySelector(`.likes_count_${post_id}`)
    likes  = String(likes.innerText).split('')
    likes = parseInt(likes[0])
    

    const request = new Request(
        url,
      { headers: { 'X-CSRFToken': csrftoken } }
    );
    fetch(request, {
      method: 'POST',
      mode: 'same-origin',
      body: JSON.stringify({
          post_id : parseInt(post_id),
      })
    })
      .then(response => response.json())
      .then(result => {
        
        // Like-unlike post and add-remove likes count 
        if (like_icon.dataset.post === 'unliked') {
          like_btn[0].innerHTML = `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-suit-heart-fill like-icon-fill is_liked-${post_id}" data-post="liked" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1z"/>
                                  </svg>`                    
                                  
          likes_count.innerHTML = `${likes + 1} Likes`

        } else {
          like_btn[0].innerHTML = `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-suit-heart like-icon is_liked-${post_id}" data-post="unliked" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 6.236l.894-1.789c.222-.443.607-1.08 1.152-1.595C10.582 2.345 11.224 2 12 2c1.676 0 3 1.326 3 2.92 0 1.211-.554 2.066-1.868 3.37-.337.334-.721.695-1.146 1.093C10.878 10.423 9.5 11.717 8 13.447c-1.5-1.73-2.878-3.024-3.986-4.064-.425-.398-.81-.76-1.146-1.093C1.554 6.986 1 6.131 1 4.92 1 3.326 2.324 2 4 2c.776 0 1.418.345 1.954.852.545.515.93 1.152 1.152 1.595L8 6.236zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.55 7.55 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z"/>
                                  </svg>`

          likes_count.innerHTML = `${likes - 1} Likes`
        }
        
      })   
      .catch(error => {
        console.log(`Error: ${error}`);
      })

  }
})

// Edit Post 
const edit_btn = document.querySelectorAll('.edit-link')

edit_btn.forEach(button => {
  button.onclick = function() {
    const post_ID = this.dataset.post_id;
    const post_element = document.querySelector(`#post_text_${post_ID}`);
    const post_text = post_element.innerText;
    
    // Create textarea element and populate it with post text
    const textarea = document.createElement('textarea');
    textarea.setAttribute('class', 'form-control');
    textarea.classList.add(`post-id-${post_ID}`);
    textarea.setAttribute('rows', '3');
    textarea.innerText = post_text;

    post_element.replaceWith(textarea);

    // Save edit button and Cancel edit button
    textarea.insertAdjacentHTML('afterend', `<button type="submit" class="btn btn-primary btn-sm mt-2" id="edit-btn-${post_ID}">Save</button>
    <button type="button" class="btn btn-secondary btn-sm mt-2" id="cancelEdit-btn-${post_ID}">Cancel</button>`)
    const edit_btn = document.querySelector(`#edit-btn-${post_ID}`)
    const cancelEdit_btn = document.querySelector(`#cancelEdit-btn-${post_ID}`)
    // Edit button
    const edit_cta_btn = document.querySelector(`#action-container__edit-${post_ID}`);
    edit_cta_btn.remove();

    const form = document.querySelector(`.edit-form-${post_ID}`);
    const url = form.getAttribute('action');
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const like_form = document.querySelector(`#like-form-${post_ID}`);

    textarea.addEventListener('keyup', getPostChanged)

    function getPostChanged(event) {
      textarea.innerContent = event.target.value
      const post_body =  textarea.innerContent
      
      
      form.onsubmit = function (e) {
        e.preventDefault()
        
        const request = new Request(
          url,
          { headers: { 'X-CSRFToken': csrftoken } }
        );
        fetch(request, {
          method: 'POST',
          mode: 'same-origin',
          body: JSON.stringify({
            post_ID: parseInt(post_ID),
            post_body: post_body
          })
        })
          .then(response => response.json())
          .then(result => {
              console.log(result)
              const post_edited = result.post
              const element_tag = document.createElement('div')
              element_tag.setAttribute('id', `post_text_${ post_ID}`)
              textarea.replaceWith(element_tag)
              element_tag.innerHTML = post_edited
              edit_btn.remove()
              cancelEdit_btn.remove()
              like_form.insertAdjacentHTML('afterend', `<div id="action-container__edit-${post_ID}">
                                                          <a href="javascript:void(0)" class="icon-link edit-link text-decoration-none" data-post_id="${post_ID}" role="button">
                                                            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pencil" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                              <path fill-rule="evenodd" d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                                            </svg>
                                                          </a>
                                                          <span> Edit Post</span>
                                                        </div>`)
          })
          .catch(error => {
            console.log(`Error: ${error}`);
          })
        
      }
      
    }
  
    cancelEdit_btn.onclick = function() {
      textarea.replaceWith(post_element)
      post_element.innerHTML = post_text
      like_form.insertAdjacentHTML('afterend', `<div id="action-container__edit-${post_ID}">
                                                          <a href="javascript:void(0)" class="icon-link edit-link text-decoration-none" data-post_id="${post_ID}" role="button">
                                                            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pencil" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                              <path fill-rule="evenodd" d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                                            </svg>
                                                          </a>
                                                          <span> Edit Post</span>
                                                        </div>`)
      edit_btn.remove()
      cancelEdit_btn.remove()
    }
    
  }

})


// Scroll to Top button pointer
const btnScrollToTop = document.querySelector('.btnScrollToTop');

btnScrollToTop.addEventListener('click', function () {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth"

  });
})

