import { jsx } from "@app/html-jsx";
import { requireAccountRole } from "@app/auth";

export const promoAdminPageRoute = app.get("/", async (ctx, req) => {
  // Проверяем права (только Staff/Admin)
  requireAccountRole(ctx, "Staff");

  return (
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Управление промокодами | ТЕО</title>
        <script src="/s/metric/clarity.js" async></script>
        <script src="/s/static/lib/vue.global.3.5.13.js"></script>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #f5f5f5;
            color: #1f2937;
            line-height: 1.5;
          }
          
          #app {
            min-height: 100vh;
          }
          
          .promo-admin {
            max-width: 1400px;
            margin: 0 auto;
            padding: 24px;
          }
          
          .promo-admin__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .promo-admin__title {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          
          .promo-admin__title h1 {
            font-size: 28px;
            font-weight: 700;
            color: #111827;
            margin: 0;
          }
          
          .promo-admin__back {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            color: #374151;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
          }
          
          .promo-admin__back:hover {
            background: #f9fafb;
            border-color: #d1d5db;
          }
          
          .promo-admin__loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px 20px;
            color: #6b7280;
          }
          
          .promo-admin__spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #e5e7eb;
            border-top-color: #A88BC8;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          .promo-admin__error {
            text-align: center;
            padding: 60px 20px;
          }
          
          .promo-admin__error-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          
          .promo-admin__error-text {
            color: #ef4444;
            font-size: 16px;
            margin-bottom: 20px;
          }
          
          .promo-admin__retry {
            padding: 10px 20px;
            background: #A88BC8;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          }
          
          .promo-admin__retry:hover {
            background: #8E6FB2;
          }
          
          .promo-admin__toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 16px 24px;
            border-radius: 12px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            animation: slideIn 0.3s ease;
            z-index: 1001;
            max-width: 400px;
          }
          
          .promo-admin__toast--success {
            background: #10b981;
          }
          
          .promo-admin__toast--error {
            background: #ef4444;
          }
          
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @media (max-width: 768px) {
            .promo-admin {
              padding: 16px;
            }
            
            .promo-admin__header {
              flex-direction: column;
              align-items: flex-start;
              gap: 16px;
            }
            
            .promo-admin__title h1 {
              font-size: 22px;
            }
          }
        `}</style>
      </head>
      <body>
        <div id="app"></div>

        <script type="module">{`
          const { createApp, ref, onMounted, defineAsyncComponent } = Vue;

          // Загружаем компоненты
          const PromoList = defineAsyncComponent(() => 
            import('/v-2/teo/promo-service/components/PromoList.vue')
          );
          
          const PromoForm = defineAsyncComponent(() => 
            import('/v-2/teo/promo-service/components/PromoForm.vue')
          );

          createApp({
            components: {
              PromoList,
              PromoForm
            },
            template: \`
              <div class="promo-admin">
                <header class="promo-admin__header">
                  <div class="promo-admin__title">
                    <a href="/v-2/admin" class="promo-admin__back">
                      ← Назад в админку
                    </a>
                    <h1>Управление промокодами</h1>
                  </div>
                </header>

                <promo-list
                  v-if="!loading && !error"
                  :promos="promos"
                  @create="openCreateForm"
                  @edit="openEditForm"
                  @delete="handleDelete"
                  @toggle="handleToggle"
                />

                <div v-else-if="loading" class="promo-admin__loading">
                  <div class="promo-admin__spinner"></div>
                  <p>Загрузка промокодов...</p>
                </div>

                <div v-else-if="error" class="promo-admin__error">
                  <div class="promo-admin__error-icon">⚠️</div>
                  <p class="promo-admin__error-text">{{ error }}</p>
                  <button class="promo-admin__retry" @click="loadPromos">
                    Попробовать снова
                  </button>
                </div>

                <promo-form
                  v-if="showForm"
                  :promo="editingPromo"
                  @close="closeForm"
                  @submit="handleSubmit"
                />

                <div
                  v-if="toast"
                  :class="['promo-admin__toast', 'promo-admin__toast--' + toast.type]"
                >
                  {{ toast.message }}
                </div>
              </div>
            \`,
            setup() {
              const promos = ref([]);
              const loading = ref(true);
              const error = ref('');
              const showForm = ref(false);
              const editingPromo = ref(null);
              const toast = ref(null);

              const API_BASE = '/v-2/teo/promo-service/api';

              function showToast(message, type = 'success') {
                toast.value = { message, type };
                setTimeout(() => {
                  toast.value = null;
                }, 4000);
              }

              async function loadPromos() {
                loading.value = true;
                error.value = '';

                try {
                  const response = await fetch(API_BASE + '/admin/promo/list');
                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.error || 'Ошибка загрузки');
                  }

                  promos.value = data.promos || [];
                } catch (err) {
                  error.value = err.message || 'Не удалось загрузить промокоды';
                } finally {
                  loading.value = false;
                }
              }

              function openCreateForm() {
                editingPromo.value = null;
                showForm.value = true;
              }

              function openEditForm(promo) {
                editingPromo.value = promo;
                showForm.value = true;
              }

              function closeForm() {
                showForm.value = false;
                editingPromo.value = null;
              }

              async function handleSubmit(formData) {
                const isEditing = !!formData.id;
                const url = isEditing
                  ? API_BASE + '/admin/promo/update'
                  : API_BASE + '/admin/promo/create';

                try {
                  const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                  });

                  const data = await response.json();

                  if (!data.success) {
                    throw new Error(data.error || 'Ошибка сохранения');
                  }

                  showToast(
                    isEditing ? 'Промокод обновлен' : 'Промокод создан',
                    'success'
                  );
                  closeForm();
                  await loadPromos();
                } catch (err) {
                  showToast(err.message, 'error');
                }
              }

              async function handleDelete(promo) {
                if (!confirm('Удалить промокод "' + promo.code + '"?')) {
                  return;
                }

                try {
                  const response = await fetch(API_BASE + '/admin/promo/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: promo.id })
                  });

                  const data = await response.json();

                  if (!data.success) {
                    throw new Error(data.error || 'Ошибка удаления');
                  }

                  showToast('Промокод удален', 'success');
                  await loadPromos();
                } catch (err) {
                  showToast(err.message, 'error');
                }
              }

              async function handleToggle(promo) {
                const newStatus = !promo.isActive;
                const action = newStatus ? 'активирован' : 'деактивирован';

                try {
                  const response = await fetch(API_BASE + '/admin/promo/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: promo.id,
                      isActive: newStatus
                    })
                  });

                  const data = await response.json();

                  if (!data.success) {
                    throw new Error(data.error || 'Ошибка обновления');
                  }

                  showToast('Промокод ' + action, 'success');
                  await loadPromos();
                } catch (err) {
                  showToast(err.message, 'error');
                }
              }

              onMounted(loadPromos);

              return {
                promos,
                loading,
                error,
                showForm,
                editingPromo,
                toast,
                loadPromos,
                openCreateForm,
                openEditForm,
                closeForm,
                handleSubmit,
                handleDelete,
                handleToggle
              };
            }
          }).mount('#app');
        `}</script>
      </body>
    </html>
  );
});
