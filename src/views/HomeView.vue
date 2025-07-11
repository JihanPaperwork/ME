<script setup>
import AboutSection from '../components/AboutSection.vue';
import EducationSection from '../components/EducationSection.vue';
import SkillsSection from '../components/SkillsSection.vue';
import ExperienceSection from '../components/ExperienceSection.vue';
import ProjectsCarousel from '../components/ProjectsCarousel.vue';
import ContactSection from '../components/ContactSection.vue';
</script>

<template>
  <main class="container py-5">
    <AboutSection id="about" class="mb-5" />
    <EducationSection id="education" class="mb-5" />
    <SkillsSection id="skills" class="mb-5" />
    <ExperienceSection id="experience" class="mb-5" />
    <ProjectsCarousel id="projects" class="mb-5" />
    <ContactSection id="contact" class="mb-5" />
  </main>
</template>