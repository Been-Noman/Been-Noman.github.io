document.addEventListener('DOMContentLoaded', () => {
    // Dynamic blog post loading
    loadBlogPosts();

    // Smooth scrolling for navigation
    setupSmoothScrolling();

    // Light/Dark mode toggle
    setupThemeToggle();

    // Animated skill bars
    animateSkillBars();

    // Lazy loading for images
    setupLazyLoading();

    // Interactive project filters
    setupProjectFilters();

    // Testimonial carousel
    setupTestimonialCarousel();
});

async function loadBlogPosts() {
    const blogContainer = document.querySelector('.blog-posts');
    try {
        const response = await fetch('/api/blog-posts.json');
        const posts = await response.json();
        posts.forEach(post => {
            const postElement = createPostElement(post);
            blogContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}

function createPostElement(post) {
    const article = document.createElement('article');
    article.classList.add('blog-post');
    article.innerHTML = `
        <h3>${post.title}</h3>
        <p class="post-meta">Published on ${new Date(post.date).toLocaleDateString()}</p>
        <p>${post.excerpt}</p>
        <a href="${post.url}" class="read-more">Read more</a>
    `;
    return article;
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    function toggleTheme(theme) {
        document.body.classList.toggle('dark-theme', theme === 'dark');
        localStorage.setItem('theme', theme);
    }

    themeToggle.addEventListener('click', () => {
        let theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            theme = 'light';
        } else {
            theme = 'dark';
        }
        toggleTheme(theme);
    });

    const savedTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
    toggleTheme(savedTheme);
}

function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar');
    const animateSkill = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(animateSkill, {
        root: null,
        threshold: 0.5,
    });

    skillBars.forEach(bar => observer.observe(bar));
}

function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const loadImage = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.src = entry.target.dataset.src;
                observer.unobserve(entry.target);
            }
        });
    };

    const imageObserver = new IntersectionObserver(loadImage, {
        root: null,
        threshold: 0.1,
    });

    images.forEach(image => imageObserver.observe(image));
}

function setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.project-filter button');
    const projects = document.querySelectorAll('.project');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            projects.forEach(project => {
                if (filter === 'all' || project.dataset.category === filter) {
                    project.style.display = 'block';
                } else {
                    project.style.display = 'none';
                }
            });
        });
    });
}

function setupTestimonialCarousel() {
    const testimonials = document.querySelectorAll('.testimonial');
    let currentTestimonial = 0;

    function showTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.classList.toggle('active', i === index);
        });
    }

    function nextTestimonial() {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }

    function previousTestimonial() {
        currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
        showTestimonial(currentTestimonial);
    }

    document.querySelector('.testimonial-next').addEventListener('click', nextTestimonial);
    document.querySelector('.testimonial-prev').addEventListener('click', previousTestimonial);

    showTestimonial(currentTestimonial);
    setInterval(nextTestimonial, 5000); // Auto-advance every 5 seconds
}
