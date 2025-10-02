module Jekyll
  module AssetVersioning
    def asset_versioned(path)
      # Add timestamp-based versioning for cache busting
      timestamp = Time.now.to_i
      "#{path}?v=#{timestamp}"
    end

    def asset_hash_versioned(path)
      # Add content-based hash versioning for more reliable cache busting
      site = @context.registers[:site]
      file_path = File.join(site.source, path)
      
      if File.exist?(file_path)
        require 'digest'
        content = File.read(file_path)
        hash = Digest::MD5.hexdigest(content)[0..8]
        "#{path}?v=#{hash}"
      else
        path
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::AssetVersioning)
