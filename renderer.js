/**
 * Renderer entry: wires form, tabs, and carrier suggestions.
 * Form/suggestion/result logic lives in js/ (form, suggestions, results).
 */
import { getFormValues, setFormValues, createEmptyInputs } from './js/form.js';
import { calculateCarrierSuggestions } from './js/suggestions.js';
import { renderResult, resetForm } from './js/results.js';

window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rating-form');
  const resetBtn = document.getElementById('resetBtn');
  const productTypeSelect = document.getElementById('productType');
  const tabsContainer = document.getElementById('tabsContainer');
  const addTabBtn = document.getElementById('addTabBtn');

  const autoSections = Array.from(document.querySelectorAll('.section-auto'));
  const homeSections = Array.from(document.querySelectorAll('.section-home'));
  const commercialSections = Array.from(document.querySelectorAll('.section-commercial'));

  const profiles = [];
  let activeProfileId = null;

  function renderTabs() {
    if (!tabsContainer) return;
    tabsContainer.innerHTML = '';
    profiles.forEach((p, index) => {
      const namePart = (p.inputs && p.inputs.clientName ? p.inputs.clientName.trim() : '') || '';
      let typePart = '';
      if (p.inputs && p.inputs.productType) {
        if (p.inputs.productType === 'home') typePart = 'Home';
        else if (p.inputs.productType === 'commercial') typePart = 'Commercial';
        else typePart = 'Auto';
      }

      let label = '';
      if (namePart || typePart) {
        label = [namePart || 'Unnamed', typePart || ''].filter(Boolean).join(' – ');
      } else {
        label = `Quote ${index + 1}`;
      }

      const div = document.createElement('div');
      div.className = 'tab-pill' + (p.id === activeProfileId ? ' active' : '');
      div.dataset.profileId = p.id;
      div.innerHTML = `<span>${label}</span>${
        profiles.length > 1 ? '<button type="button" data-close="1">×</button>' : ''
      }`;
      tabsContainer.appendChild(div);
    });
  }

  function switchToProfile(id) {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;
    activeProfileId = id;
    setFormValues(profile.inputs);
    updateSectionsVisibility();

    if (profile.lastSuggestions) {
      renderResult(profile.inputs, profile.lastSuggestions);
    } else {
      document.getElementById('resultSummary').textContent =
        'Fill in the form and click "Suggest Carriers".';
      document.getElementById('resultDetails').innerHTML = '';
    }
    renderTabs();
  }

  function addNewProfile() {
    const newProfile = {
      id: `profile-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      label: '',
      inputs: createEmptyInputs(),
      lastSuggestions: null,
    };
    profiles.push(newProfile);
    switchToProfile(newProfile.id);
  }

  function closeProfile(id) {
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx === -1 || profiles.length === 1) return;
    profiles.splice(idx, 1);
    if (activeProfileId === id) {
      const newActive = profiles[Math.max(0, idx - 1)];
      activeProfileId = newActive.id;
      switchToProfile(activeProfileId);
    } else {
      renderTabs();
    }
  }

  function updateSectionsVisibility() {
    const type = productTypeSelect.value;

    autoSections.forEach((el) => {
      el.style.display = type === 'auto' ? '' : 'none';
    });

    homeSections.forEach((el) => {
      el.style.display = type === 'home' ? '' : 'none';
    });

    commercialSections.forEach((el) => {
      el.style.display = type === 'commercial' ? '' : 'none';
    });
  }

  if (productTypeSelect) {
    productTypeSelect.addEventListener('change', updateSectionsVisibility);
    updateSectionsVisibility();
  }

  if (profiles.length === 0) {
    const initialProfile = {
      id: 'profile-1',
      label: 'Quote 1',
      inputs: createEmptyInputs(),
      lastSuggestions: null,
    };
    profiles.push(initialProfile);
    activeProfileId = initialProfile.id;
    renderTabs();
  }

  if (tabsContainer) {
    tabsContainer.addEventListener('click', (event) => {
      const target = event.target;
      const pill = target.closest('.tab-pill');
      if (!pill) return;
      const id = pill.dataset.profileId;
      if (!id) return;

      if (target instanceof HTMLButtonElement && target.dataset.close === '1') {
        closeProfile(id);
      } else {
        switchToProfile(id);
      }
    });
  }

  if (addTabBtn) {
    addTabBtn.addEventListener('click', () => {
      addNewProfile();
    });
  }

  if (form) {
    const syncActiveProfile = () => {
      const profile = profiles.find((p) => p.id === activeProfileId);
      if (!profile) return;
      profile.inputs = getFormValues();
      renderTabs();
    };

    form.addEventListener('input', syncActiveProfile);
    form.addEventListener('change', syncActiveProfile);
  }

  const active = profiles.find((p) => p.id === activeProfileId);
  if (active) {
    setFormValues(active.inputs);
    updateSectionsVisibility();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const inputs = getFormValues();
    const suggestions = calculateCarrierSuggestions(inputs);

    const profile = profiles.find((p) => p.id === activeProfileId);
    if (profile) {
      profile.inputs = inputs;
      profile.lastSuggestions = suggestions;
    }

    renderResult(inputs, suggestions);
  });

  resetBtn.addEventListener('click', () => {
    const profile = profiles.find((p) => p.id === activeProfileId);
    if (profile) {
      profile.inputs = createEmptyInputs();
      profile.lastSuggestions = null;
      setFormValues(profile.inputs);
      updateSectionsVisibility();
    }
    resetForm();
  });
});
