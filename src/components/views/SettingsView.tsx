interface SettingsViewProps {
  category?: 'general' | 'appearance' | 'shortcuts';
}

const SettingsView = ({ category = 'general' }: SettingsViewProps) => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
        Settings
      </h1>
      <div className="space-y-4">
        <div className="text-text-secondary dark:text-text-secondary-dark">
          <p>Category: <span className="capitalize">{category}</span></p>
        </div>
        <div className="text-text-secondary dark:text-text-secondary-dark">
          Settings interface coming soon...
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nihil ipsam itaque sed, sunt fugiat, quam inventore facilis distinctio in, adipisci nemo ducimus aliquid necessitatibus voluptas asperiores doloremque dicta eligendi expedita possimus rerum quaerat. Cum natus necessitatibus cupiditate itaque deserunt ullam voluptatum labore amet. Modi veniam neque recusandae corrupti, laudantium tenetur eaque repudiandae impedit, maxime qui tempora. Provident dolore debitis minima laudantium repellat quidem commodi dolores tempore, incidunt velit eos quam enim quos rerum? Eius cupiditate accusamus pariatur ad, deserunt ipsum quos debitis provident illo laborum quibusdam libero sit eos quisquam doloremque. Officiis corrupti eos adipisci consequuntur molestiae labore cumque est quisquam, esse ex? Molestias, libero, ipsa vitae quibusdam corporis accusantium quod repellendus nemo velit adipisci saepe consequatur et perferendis aliquam quam earum pariatur voluptate distinctio ad cumque quasi cum? Qui ducimus doloribus eveniet laboriosam sit iure nam asperiores, atque harum corporis illo facere repellendus aliquam ullam sed esse sapiente possimus ipsam eos dolor minus! Porro nemo, vel dolor laborum, nihil aspernatur fuga quam omnis qui explicabo inventore cupiditate nobis molestiae consectetur iusto saepe quaerat libero aperiam dolorum illum. Dignissimos consectetur facere corrupti temporibus aliquam ut ratione, ex eaque molestiae id voluptates adipisci a deserunt quod repudiandae nisi quibusdam? Culpa, fugit reiciendis nesciunt magni impedit debitis saepe, neque repellendus molestias possimus natus blanditiis temporibus dolor. Nostrum aspernatur officiis iure alias et, aut illo dolorem laboriosam architecto, ad officia amet dolore, eaque ullam expedita saepe temporibus? Dicta magni cum deleniti enim sequi provident non tempora. Quis reprehenderit eveniet ratione earum possimus soluta sunt asperiores? Magnam in quod neque inventore tenetur doloribus at mollitia laboriosam vel minima ratione corporis, sapiente, sed quibusdam repellendus sequi officia deleniti optio fuga saepe magni obcaecati? Veritatis eius aliquid neque expedita sunt deleniti distinctio odio facere perferendis nemo, aut dolores maxime quos facilis fugit. Aperiam, animi voluptas amet consequatur ea quasi nesciunt vel totam nostrum ex, facere consequuntur corrupti aut adipisci? Nostrum illum dicta sequi amet, recusandae repudiandae facilis sint itaque quod exercitationem doloremque! Eum commodi nesciunt natus similique maiores perspiciatis, at veritatis illum repudiandae, ipsum cumque perferendis numquam fugiat aperiam temporibus provident harum id consequatur iste. Aspernatur qui magnam, natus temporibus accusantium iure. Aliquid commodi ipsam suscipit dolorum quia accusamus minus explicabo facilis veniam necessitatibus excepturi ut velit quos molestias, tempora dignissimos rerum deserunt ducimus iste ratione vitae voluptate nemo perferendis quibusdam? Laboriosam adipisci incidunt fuga doloremque harum deleniti velit earum odio deserunt, consequatur dicta voluptatem. Velit?
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
